import { Db } from '@db';
import { Ctx, getActiveWorkspaces, getSelectionText, getWorkspaceFileTree } from '@utils';
import * as vscode from 'vscode';

export class Context {
  constructor(private database: Db) {}

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

  async searchRelevant(search: string, limit?: number) {
    if (!getActiveWorkspaces().length) return [];
    return this.database.semanticSearch(search, getActiveWorkspaces(), limit);
  }

  async getContext(): Promise<Ctx> {
    const fileTree = await getWorkspaceFileTree();

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
    };

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
