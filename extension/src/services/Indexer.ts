import { Observer } from '@observer';
import {
  COMMANDS,
  DbFile,
  filePattern,
  foldersPattern,
  getFileWorkspaceUrl,
  getRelativeToWorkspaceFilePath,
  IndexingPayload,
  uuid,
  WORKSPACE_INDEX_PREFIX,
} from '@utils';
import * as vscode from 'vscode';

import { VectorStorage } from './database/vectorStorage';

export class Indexer {
  private observer = Observer.getInstance();

  constructor(
    private context: vscode.ExtensionContext,
    private database: VectorStorage,
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

  async chunckFile(uri: vscode.Uri, chunkSize = 10) {
    const bytes = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder().decode(bytes).slice(0, this.maxChars);
    const path = getRelativeToWorkspaceFilePath(uri);

    const chunks: DbFile[] = [];

    const lines = content.split(/\r?\n/);

    for (let startLine = 0; startLine < lines.length; startLine += chunkSize) {
      const endLine = Math.min(startLine + chunkSize, lines.length);

      const text = lines
        .slice(startLine, endLine)
        .map((line, idx) => `${startLine + idx}| ${line}`)
        .join('\n');

      chunks.push({ path, text, workspace: getFileWorkspaceUrl(uri), id: uuid() });
    }

    return chunks;
  }

  async indexFile(uri: vscode.Uri, chunkSize = 10, deleteFiles = true) {
    console.log('indexFile');
    const chunks = await this.chunckFile(uri, chunkSize);
    return this.database.putFileChunks(chunks, deleteFiles);
  }

  async deleteFiles(uris: vscode.Uri[]) {
    const workspaceMap = new Map<string, string[]>(); // workspacePath -> [fileUriStrings]

    for (const uri of uris) {
      const folder = vscode.workspace.getWorkspaceFolder(uri);
      if (!folder) continue;

      const workspacePath = folder.uri.fsPath;
      const uriString = Indexer.getStringUri(uri);

      if (!workspaceMap.has(workspacePath)) {
        workspaceMap.set(workspacePath, []);
      }
      workspaceMap.get(workspacePath)!.push(uriString);
    }

    for (const [workspace, uriStrings] of workspaceMap.entries()) {
      console.log(`Deleting files from workspace: ${workspace}`, uriStrings);
      await this.database.deleteFiles(workspace, uriStrings);
    }
  }

  async onWorkspaceChange() {
    const observer = Observer.getInstance();
    const workspaces = vscode.workspace.workspaceFolders?.map((f) => f.uri.fsPath).filter(Boolean);
    if (!workspaces) return;

    const indexes = await this.retrieveWorkspaceIndexes(workspaces);
    observer.emit(COMMANDS.onChangeWorkspace, indexes);

    return this.checkAndIndexWorkspace();
  }

  async checkAndIndexWorkspace(force?: boolean) {
    const isIndexed = await this.isWorkspacesIndexed();
    console.log('INDEXED', isIndexed);

    const workspaces = isIndexed.filter((el) => force || !el.indexed);

    for (const w of workspaces) {
      console.log(`Indexing workspace: ${w.workspace}`);
      await this.indexWorkspace(w.workspace);
    }
  }

  async isWorkspacesIndexed() {
    const workspaces = vscode.workspace.workspaceFolders?.map((f) => f.uri.fsPath);
    if (!workspaces) return [];
    const indexes = await this.retrieveWorkspaceIndexes(workspaces);

    return Object.entries(indexes).map(([workspace, val]) => ({
      workspace,
      indexed: val.status === 'done',
    }));
  }

  async indexWorkspace(workspace: string) {
    this.observer.emit('indexing', {
      status: 'pending',
      progress: 0,
      indexed: 0,
      total: 0,
      workspace,
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
          status: 'error',
          progress: 0,
          indexed,
          total,
          error: err.message,
          currentFile: uri.fsPath,
          workspace,
        });
      }

      const progress = Math.round((indexed / total) * 100);

      const indexData: IndexingPayload = {
        status: 'pending',
        progress,
        indexed,
        total,
        currentFile: uri.fsPath,
        workspace,
      };

      this.observer.emit('indexing', indexData);
      await this.persistWorkspaceIndex(workspace, indexData);
    }

    const doneData: IndexingPayload = {
      status: 'done',
      progress: 100,
      indexed: total,
      total,
      workspace,
    };

    this.observer.emit('indexing', doneData);

    await this.persistWorkspaceIndex(workspace, doneData);

    return total;
  }

  async persistWorkspaceIndex(workspace: string, data: IndexingPayload) {
    const name = WORKSPACE_INDEX_PREFIX + workspace;
    return this.context.globalState.update(name, data);
  }

  async retrieveWorkspaceIndexes(workspaces: string[]) {
    const defaultIndex: IndexingPayload = {
      status: 'not-indexed',
      total: 0,
      indexed: 0,
      progress: 0,
      workspace: 'noname',
    };

    const promises = workspaces.map((w) => {
      const retrieved = this.context.globalState.get<IndexingPayload>(WORKSPACE_INDEX_PREFIX + w);

      return retrieved ?? { ...defaultIndex, workspace: w };
    });

    const response = await Promise.all(promises);

    return response.filter(Boolean).reduce(
      (acc, w) => {
        acc[w.workspace] = w;
        return acc;
      },
      {} as { [key: string]: IndexingPayload },
    );
  }
}
