import * as path from 'path';
import * as vscode from 'vscode';

import { EXCLUDED_FOLDERS } from './constants';

export const uuid = (length: number = 4): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
};

export const getWorkspaceName = () => {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return 'noname';
  }
  return folders[0].name;
};

export const stripCodeFences = (code: string) => {
  return code.replace(/^```[a-zA-Z0-9]*\s*/, '').replace(/```$/, '');
};

async function collectEntries(
  dirUri: vscode.Uri,
  rootPath: string,
  tree: string[],
): Promise<boolean> {
  const entries = await vscode.workspace.fs.readDirectory(dirUri);

  let hasFiles = false;

  for (const [name, type] of entries) {
    if (EXCLUDED_FOLDERS.includes(name)) continue;

    const entryUri = vscode.Uri.file(path.join(dirUri.fsPath, name));
    const relativePath = path.relative(rootPath, entryUri.fsPath);

    if (type === vscode.FileType.Directory) {
      const subDirHasFiles = await collectEntries(entryUri, rootPath, tree);
      if (!subDirHasFiles) {
        tree.push(relativePath + '/');
      }
      hasFiles = hasFiles || subDirHasFiles;
    } else {
      tree.push(relativePath);
      hasFiles = true;
    }
  }

  return hasFiles;
}

export async function getWorkspaceFileTree(): Promise<string[]> {
  const rootUri = vscode.workspace.workspaceFolders?.[0]?.uri;
  if (!rootUri) return [];

  const rootPath = rootUri.fsPath;
  const tree: string[] = [];

  await collectEntries(rootUri, rootPath, tree);

  return tree.sort();
}

export const replaceLast = (str: string, search: string, replacement: string) => {
  const index = str.lastIndexOf(search);
  if (index === -1) return str;
  return str.slice(0, index) + replacement + str.slice(index + search.length);
};

export const getFileContent = async (uri: vscode.Uri) => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw new Error('No workspace folder open');
  }

  const absolutePath = path.join(workspaceFolder.uri.fsPath, uri.path);

  const fileUri = vscode.Uri.file(absolutePath);
  const fileData = await vscode.workspace.fs.readFile(fileUri);
  return Buffer.from(fileData).toString('utf-8');
};

export const resolveFilePath = (filePath: string, root: string) => {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
  return vscode.Uri.file(absolutePath);
};
