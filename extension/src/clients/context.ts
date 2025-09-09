import * as vscode from 'vscode';

export class ContextHandler {
  maxFiles: number;
  maxChars: number;

  constructor(maxFiles = 6, maxChars = 60000) {
    this.maxFiles = maxFiles;
    this.maxChars = maxChars;
  }

  private cleanContent(text: string, lang: string): string {
    let withoutComments = text;

    // Простейшие regex для популярных языков
    if (['ts', 'tsx', 'js', 'jsx', 'java', 'go', 'rs', 'cs'].includes(lang)) {
      withoutComments = withoutComments
        .replace(/\/\/.*$/gm, '') // однострочные
        .replace(/\/\*[\s\S]*?\*\//gm, ''); // многострочные
    } else if (lang === 'py') {
      withoutComments = withoutComments.replace(/#.*$/gm, '');
    }

    // Убираем лишние пустые строки
    return withoutComments.replace(/^\s*$(?:\r\n?|\n)/gm, '');
  }

  private async getCandidateUris(query?: string): Promise<vscode.Uri[]> {
    const patterns = [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.py',
      '**/*.go',
      '**/*.java',
      '**/*.rs',
      '**/*.cs',
      '**/*.json',
      '**/*.md',
    ];

    const uris: vscode.Uri[] = [];
    for (const pattern of patterns) {
      const found = await vscode.workspace.findFiles(
        pattern,
        '**/{node_modules,dist,build,out}/**',
        this.maxFiles * 3,
      );
      uris.push(...found);
      if (uris.length >= this.maxFiles * 3) break;
    }

    const ranked = await Promise.all(
      uris.map(async (u) => {
        try {
          const stat = await vscode.workspace.fs.stat(u);
          const name = u.path.split('/').pop() || '';
          const score =
            (query && name.toLowerCase().includes(query.toLowerCase()) ? 10 : 0) -
            Math.log(stat.size + 1);
          return { uri: u, score };
        } catch {
          return { uri: u, score: -Infinity };
        }
      }),
    );

    ranked.sort((a, b) => b.score - a.score);
    return ranked.slice(0, this.maxFiles).map((r) => r.uri);
  }

  private async getFileContent(uri: vscode.Uri, sliceSize: number): Promise<string> {
    try {
      const bytes = await vscode.workspace.fs.readFile(uri);
      const text = new TextDecoder('utf-8').decode(bytes);
      const ext = uri.path.split('.').pop() || '';
      const cleaned = this.cleanContent(text, ext);
      return cleaned.substring(0, sliceSize);
    } catch {
      return '';
    }
  }

  async gatherWorkspaceContext(query?: string): Promise<string> {
    let combined = '';

    const openEditors = vscode.window.visibleTextEditors.map((e) => e.document.uri);
    const uris = new Set(openEditors);

    const candidates = await this.getCandidateUris(query);
    for (const uri of candidates) uris.add(uri);

    const allUris = Array.from(uris);
    const sliceSize = Math.floor(this.maxChars / allUris.length);

    for (const u of allUris) {
      const content = await this.getFileContent(u, sliceSize);
      if (!content) continue;

      combined += `\n===== FILE: ${u.path.split('/').pop()} =====\n${content}`;
      if (combined.length >= this.maxChars) break;
    }

    return combined.substring(0, this.maxChars);
  }

  /**
   * Вернуть контекст для текущего редактора
   */
  async getContext(): Promise<{
    editor?: vscode.TextEditor;
    selection: string;
    workspaceContext: string;
    currentFilePath: string;
    language?: string;
  }> {
    const editor = vscode.window.activeTextEditor;
    const selection = editor?.document.getText(editor.selection) || '';
    const workspaceContext = await this.gatherWorkspaceContext();
    const currentFilePath = editor?.document.uri.fsPath || 'none';
    const language = editor?.document.languageId;

    return { editor, selection, workspaceContext, currentFilePath, language };
  }
}
