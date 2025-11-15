import { ChatMessage, DbFile, FileChunk } from '@utils';
import * as vscode from 'vscode';

import { SessionStorage, VectorStorage } from './storages';

export class Db {
  private static _instance: Db;
  private vectorStorage: VectorStorage;
  private sessionStorage: SessionStorage;

  constructor(ctx: vscode.ExtensionContext) {
    this.vectorStorage = new VectorStorage(ctx);
    this.sessionStorage = new SessionStorage(ctx);
  }

  static getInstance(context?: vscode.ExtensionContext): Db {
    if (!Db._instance) {
      if (!context) {
        throw new Error('Db must be initialized with a vscode.ExtensionContext the first time.');
      }
      Db._instance = new Db(context);
    }
    return Db._instance;
  }

  async init() {
    return this.vectorStorage.init();
  }

  semanticSearch(search: string, workspaces: string[], limit = 5): Promise<FileChunk[]> {
    return this.vectorStorage.searchKNN(search, workspaces, limit);
  }

  clearWorkspace(workspace: string) {
    return this.vectorStorage.clearWorkspace(workspace);
  }

  deleteFiles(workspace: string, paths: string[]) {
    return this.vectorStorage.deleteFiles(workspace, paths);
  }

  addFiles(chunks: DbFile[], deleteFiles = true) {
    return this.vectorStorage.putFileChunks(chunks, deleteFiles);
  }

  isWorkspaceIndexed(workspace: string) {
    return this.vectorStorage.isWorkspaceIndexed(workspace);
  }

  async addChatHistoryItems(message: ChatMessage[]) {
    return this.sessionStorage.addChatHistoryItems(message);
  }

  get history() {
    return this.sessionStorage.history;
  }

  clearHistory() {
    return this.sessionStorage.clear();
  }

  renameFile(workspace: string, oldPath: string, newPath: string) {
    return this.vectorStorage.renameFile(workspace, oldPath, newPath);
  }
}
