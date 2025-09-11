import * as vscode from 'vscode';

import { FileChunk, filePatterns, foldersPattern, getWorkspaceName } from '../utils';

export class Context {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private embedder: any;
  private _embeddings: { [key: string]: FileChunk[] } = {};

  get embeddings() {
    return this._embeddings[getWorkspaceName()] ?? [];
  }

  set embeddings(embeddings: FileChunk[]) {
    this._embeddings[getWorkspaceName()] = embeddings;
  }

  constructor(
    private maxFiles = 50,
    private maxChars = 5000,
  ) {}

  async indexFile(uri: vscode.Uri) {
    if (!vscode.workspace.workspaceFolders?.length || !this.embedder) return [];
    const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

    const bytes = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder().decode(bytes).slice(0, this.maxChars);
    const texts = content.match(/[\s\S]{1,500}/g) || [];
    const filePath = uri.fsPath.replace(root + '/', '');
    const chunks: FileChunk[] = [];
    for (const text of texts) {
      chunks.push({ filePath, text, workspace: getWorkspaceName() });
    }
    return chunks;
  }

  async indexWorkspace() {
    let uris: vscode.Uri[] = [];

    for (const pattern of filePatterns) {
      const found = await vscode.workspace.findFiles(pattern, foldersPattern, this.maxFiles * 3);
      uris.push(...found);
      if (uris.length >= this.maxFiles) break;
    }

    uris = uris.slice(0, this.maxFiles);
    const chunks: FileChunk[] = [];

    for (const uri of uris) {
      const fileChunks = await this.indexFile(uri);
      chunks.concat(fileChunks);
    }

    this.embeddings = chunks;
  }
}
