import * as path from 'path';
import * as vscode from 'vscode';

export const readFile = async (file: string) => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw new Error('No workspace folder open');
  }

  const absolutePath = path.join(workspaceFolder.uri.fsPath, file);
  const fileUri = vscode.Uri.file(absolutePath);
  const fileData = await vscode.workspace.fs.readFile(fileUri);
  return Buffer.from(fileData).toString('utf-8');
};
