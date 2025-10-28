import { Observer } from '@observer';
import {
  DbFile,
  filePattern,
  foldersPattern,
  getFileWorkspaceUrl,
  getRelativeToWorkspaceFilePath,
  getSelectionText,
  getWorkspaceFileTree,
  getWorkspacesUrl,
  parseEmbeddings,
  uuid,
} from '@utils';
import * as vscode from 'vscode';

import { VectorStorage } from './database/vectorStorage';

export type ContextWithEmbeddings = {
  editor: vscode.TextEditor | undefined;
  workspaceContext: string;
  selection: string;
  currentFilePath: string;
  language?: string;
  fileTree: string[];
};

export type ContextWithoutEmbeddings = {
  editor: vscode.TextEditor | undefined;
  selection: string;
  currentFilePath: string;
  language?: string;
  fileTree: string[];
};

export type GetContextParams = {
  contextLimit?: number;
  lookUpFileTree?: boolean;
  lookupEmbeddings?: boolean;
};

// Conditional return type
export type GetContextReturn<P extends GetContextParams | undefined = undefined> = P extends {
  lookupEmbeddings: false;
}
  ? ContextWithoutEmbeddings
  : ContextWithEmbeddings;

export class Context {
  private observer = Observer.getInstance();

  constructor(
    private database: VectorStorage,
    private maxFiles = 500,
    private maxChars = 5000,
  ) {}

  static getStringUri(uri: vscode.Uri) {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) return '';

    const folder = vscode.workspace.getWorkspaceFolder(uri);
    if (!folder) {
      return uri.fsPath.split('/').pop() || '';
    }

    const root = folder.uri.fsPath;
    const relativePath = uri.fsPath.startsWith(root)
      ? uri.fsPath.slice(root.length + 1)
      : uri.fsPath;

    if (folders.length > 1) {
      return `${folder.name}/${relativePath}`;
    }

    return relativePath;
  }

  get language() {
    const editor = vscode.window.activeTextEditor;
    return editor?.document.languageId;
  }

  async chunckFile(uri: vscode.Uri, chunkSize = 10) {
    const bytes = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder().decode(bytes).slice(0, this.maxChars);
    const path = getRelativeToWorkspaceFilePath(uri);

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
        workspace: getFileWorkspaceUrl(uri),
        id: uuid(),
      });
    }

    return chunks;
  }

  async indexFile(uri: vscode.Uri, chunkSize = 10, deleteFiles = true) {
    const chunks = await this.chunckFile(uri, chunkSize);
    return this.database.putFileChunks(chunks, deleteFiles);
  }

  async searchRelevant(search: string, limit?: number) {
    if (!getWorkspacesUrl().length) return [];
    return this.database.searchKNN(search, { workspaces: getWorkspacesUrl() }, limit);
  }

  async deleteFiles(uris: vscode.Uri[]) {
    const uriStrings = uris.map(Context.getStringUri);
    return this.database.deleteFiles(uriStrings);
  }

  async checkAndIndexWorkspace(force?: boolean) {
    const isIndexed = await this.isWorkspacesIndexed();
    const workspaces = isIndexed.filter((el) => force || !el.indexed);
    const promises = workspaces.map((w) => this.indexWorkspace(w.workspace));
    await Promise.all(promises);
  }

  async isWorkspacesIndexed() {
    const workspaces = vscode.workspace.workspaceFolders?.map((f) => f.uri.fsPath);
    if (!workspaces) return [];
    const promises = workspaces.map((workspace) =>
      this.database.isWorkspaceIndexed(workspace).then((indexed) => ({
        workspace,
        indexed,
      })),
    );
    return Promise.all(promises);
  }

  async indexWorkspace(workspace: string) {
    this.observer.emit('indexing', {
      status: 'pending',
      progress: 0,
      indexed: 0,
      total: 0,
    });

    await this.database.clearWorkspace(workspace);

    const uris: vscode.Uri[] = await vscode.workspace.findFiles(filePattern, foldersPattern);

    const total = uris.length;
    let indexed = 0;

    for (const uri of uris) {
      try {
        await this.indexFile(uri, 10, false);
        indexed++;
      } catch (err: any) {
        console.error(`❌ Failed to index ${uri.fsPath}:`, err);
        this.observer.emit('indexing', {
          status: 'pending',
          progress: 0,
          indexed,
          total,
          error: err.message,
          currentFile: uri.fsPath,
        });
      }

      const progress = Math.round((indexed / total) * 100);

      this.observer.emit('indexing', {
        status: 'pending',
        progress,
        indexed,
        total,
        currentFile: uri.fsPath,
      });
    }

    this.observer.emit('indexing', {
      status: 'done',
      progress: 100,
      indexed: total,
      total,
    });

    return total;
  }

  async getContext<P extends GetContextParams | undefined = undefined>(
    message: string,
    params?: P,
  ): Promise<GetContextReturn<P>> {
    const {
      contextLimit = 10,
      lookUpFileTree = true,
      lookupEmbeddings = true,
    } = (params ?? {}) as GetContextParams;

    const [chunks, fileTree] = await Promise.all([
      lookupEmbeddings ? this.searchRelevant(message, contextLimit) : [],
      lookUpFileTree ? getWorkspaceFileTree() : [],
    ]);

    const workspaceContext: string | undefined = lookupEmbeddings
      ? parseEmbeddings(chunks)
      : undefined;

    const editor = vscode.window.activeTextEditor;
    const selection = getSelectionText();
    const currentFilePath = editor?.document.uri.fsPath || 'none';
    const language = editor?.document.languageId;

    const data = {
      editor,
      selection,
      currentFilePath,
      language,
      fileTree,
    } as GetContextReturn<P>;

    if (lookupEmbeddings) {
      Object.assign(data, { workspaceContext: workspaceContext ?? '' });
    }
    return data;
  }

  async getFilesContent(urls?: { relative: string; absolute: string }[]) {
    if (!urls || !urls.length) return [];

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found.');
      return [];
    }

    const data = urls.map(async ({ absolute, relative }) => {
      const uri = vscode.Uri.file(absolute);

      const fileData = await vscode.workspace.fs.readFile(uri);

      return { file: relative, content: Buffer.from(fileData).toString('utf8') };
    });

    return Promise.all(data);
  }
}
