import {
  getActiveWorkspaces,
  getSelectionText,
  getWorkspaceFileTree,
  parseEmbeddings,
} from '@utils';
import * as vscode from 'vscode';

import { Db } from '@db';

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

export type GetContextReturn<P extends GetContextParams | undefined = undefined> = P extends {
  lookupEmbeddings: false;
}
  ? ContextWithoutEmbeddings
  : ContextWithEmbeddings;

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
    return this.database.searchEmbeddings(search, getActiveWorkspaces(), limit);
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
