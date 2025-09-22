import * as vscode from 'vscode';

import { CreateToolArgs, ensureDirectory, resolveFilePath } from '../../utils';

export const createFileCb = async (instruction: CreateToolArgs) => {
  console.log('ENTERING create-------------');
  if (!vscode.workspace.workspaceFolders?.length) return null;
  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

  const uri = resolveFilePath(instruction.file, root);

  try {
    await vscode.workspace.fs.stat(uri);
  } catch {
    await ensureDirectory(uri);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(instruction.content ?? '', 'utf-8'));
  }
  return instruction.file;
};
