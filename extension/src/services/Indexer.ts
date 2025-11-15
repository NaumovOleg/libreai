import { Db } from '@db';
import { Observer } from '@observer';
import {
  batchArray,
  chunkFile,
  COMMANDS,
  filePattern,
  foldersPattern,
  getFileWorkspaceUrl,
  getRelativeToWorkspaceFilePath,
  IndexingPayload,
  WORKSPACE_INDEX_PREFIX,
} from '@utils';
import * as vscode from 'vscode';

export class Indexer {
  private observer = Observer.getInstance();

  constructor(
    private context: vscode.ExtensionContext,
    private database: Db,
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

  async chunckFile(uri: vscode.Uri) {
    const bytes = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder().decode(bytes).slice(0);

    return chunkFile(content, uri);
  }

  async indexFile(uri: vscode.Uri, deleteFiles = true) {
    console.log('indexFile', uri.fsPath);
    const chunks = await this.chunckFile(uri);
    return this.database.addFiles(chunks, deleteFiles);
  }

  async deleteFiles(uris: vscode.Uri[]) {
    const workspaceMap = new Map<string, string[]>();

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
    const startIndexData: IndexingPayload = {
      status: 'pending',
      progress: 0,
      indexed: 0,
      total: 0,
      workspace,
    };
    this.observer.emit('indexing', startIndexData);

    await Promise.all([
      this.persistWorkspaceIndex(workspace, startIndexData),
      this.database.clearWorkspace(workspace),
    ]);

    const uris: vscode.Uri[] = await vscode.workspace.findFiles(filePattern, foldersPattern);
    const total = uris.length;
    let indexed = 0;
    const chunkSize = Math.min(50, Math.ceil(total / 10));
    console.log('URLS', uris);
    for (const batch of batchArray(uris, chunkSize)) {
      let currentFile: string | undefined = undefined;
      try {
        await Promise.all(
          batch.map(async (uri) => {
            currentFile = uri.fsPath;
            await this.indexFile(uri, false);
          }),
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(`❌ Failed to index batch starting with ${batch[0]?.fsPath}:`, err);
        this.observer.emit('indexing', {
          status: 'error',
          progress: 0,
          indexed,
          total,
          error: err.message,
          currentFile,
          workspace,
        });
      }

      const indexData: IndexingPayload = {
        status: indexed < total ? 'pending' : 'done',
        progress: Math.round((indexed / total) * 100),
        indexed,
        total,
        currentFile: batch[batch.length - 1]?.fsPath,
        workspace,
      };
      indexed += batch.length;
      this.observer.emit('indexing', indexData);
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

  async renameFile(newUri: vscode.Uri, oldUri: vscode.Uri) {
    const oldWorkspace = getFileWorkspaceUrl(oldUri);
    const newWorkspace = getFileWorkspaceUrl(newUri);

    if (oldWorkspace === newWorkspace) {
      return this.database.renameFile(
        oldWorkspace,
        getRelativeToWorkspaceFilePath(oldUri),
        getRelativeToWorkspaceFilePath(newUri),
      );
    }

    return Promise.all([this.deleteFiles([oldUri]), this.indexFile(newUri)]);
  }
}
