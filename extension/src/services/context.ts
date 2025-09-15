import * as path from 'path';
import * as vscode from 'vscode';

import {
  ContextT,
  DbFile,
  filePatterns,
  foldersPattern,
  getWorkspaceFileTree,
  getWorkspaceName,
  replaceLast,
  uuid,
} from '../utils';
import { DatabaseClient } from './database';

export class Context {
  constructor(
    private database: DatabaseClient,
    private maxFiles = 500,
    private maxChars = 5000,
  ) {}

  static getStringUri(uri: vscode.Uri) {
    if (!vscode.workspace.workspaceFolders?.length) return '';
    const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
    return uri.fsPath.replace(root + '/', '');
  }

  async indexFile(uri: vscode.Uri, chunkSize = 10) {
    if (!vscode.workspace.workspaceFolders?.length) return [];

    const bytes = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder().decode(bytes).slice(0, this.maxChars);
    const path = Context.getStringUri(uri);
    const chunks: DbFile[] = [];

    const lines = content.split(/\r?\n/);

    for (let startLine = 0; startLine < lines.length; startLine += chunkSize) {
      const endLine = Math.min(startLine + chunkSize, lines.length);

      const numberedLines = lines
        .slice(startLine, endLine)
        .map((line, idx) => `${startLine + idx}| ${line}`)
        .join('\n');

      chunks.push({
        path,
        text: numberedLines,
        workspace: getWorkspaceName(),
        id: uuid(),
        startLine,
        endLine: endLine - 1,
      });
    }

    await this.database.indexFiles(chunks);
    return chunks;
  }

  async searchRelevant(search: string, limit?: number) {
    return this.database.searchKNN(search, { workspace: getWorkspaceName() }, limit);
  }

  async deleteFiles(uris: vscode.Uri[]) {
    const uriStrings = uris.map(Context.getStringUri);
    return this.database.deleteFiles(uriStrings);
  }

  async indexWorkspace() {
    const isWorkspaceIndexed = await this.database.checkWorkspaceIndex();
    if (!vscode.workspace.workspaceFolders?.length || isWorkspaceIndexed) return [];
    let uris: vscode.Uri[] = [];

    for (const pattern of filePatterns) {
      const found = await vscode.workspace.findFiles(pattern, foldersPattern, this.maxFiles * 3);
      uris.push(...found);
      if (uris.length >= this.maxFiles) break;
    }

    uris = uris.slice(0, this.maxFiles);
    await Promise.all(uris.map((uri) => this.indexFile(uri)));

    return uris.length;
  }

  async getWorkspaceFileTree(): Promise<string> {
    const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    if (!root) return '';

    const files = await vscode.workspace.findFiles('**/*', foldersPattern);
    const relativePaths = files.map((file) => path.relative(root, file.fsPath));

    return relativePaths.sort().join('\n');
  }

  async getContext(
    message: string,
    params?: {
      contextLimit?: number;
      lookUpFileTree?: boolean;
    },
  ): Promise<ContextT> {
    const { contextLimit = 1000, lookUpFileTree = true } = params ?? {};

    const [chunks, fileTree] = await Promise.all([
      this.searchRelevant(message, contextLimit),
      lookUpFileTree ? getWorkspaceFileTree() : [''],
    ]);

    const ctx = chunks.reduce(
      (acc, chunk) => {
        if (!acc[chunk.path]) {
          acc[chunk.path] = `<FILE>${chunk.path} \n
          ${chunk.text}
          <FILE>`;
        } else {
          const replaceString = `\n ${chunk.text}<FILE>`;

          acc[chunk.path] = replaceLast(acc[chunk.path], '<FILE>', replaceString);
        }
        acc[chunk.path] = (acc[chunk.path] ?? '') + chunk.text;
        return acc;
      },
      {} as { [key: string]: string },
    );

    const workspaceContext = Object.values(ctx).reduce((acc, val) => {
      acc += val + '\n';
      return acc;
    }, '');

    const editor = vscode.window.activeTextEditor;
    const selection =
      (editor?.document.getText(editor.selection) || editor?.document.getText()) ?? '';
    const currentFilePath = editor?.document.uri.fsPath || 'none';
    const language = editor?.document.languageId;

    return { editor, selection, workspaceContext, currentFilePath, language, fileTree };
  }
}
