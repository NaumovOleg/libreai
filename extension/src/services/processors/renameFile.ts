import * as vscode from 'vscode';

import { RenameFileToolArgs, resolveFilePath } from '../../utils';

export const renameFileCb = async (instruction: RenameFileToolArgs) => {
  console.log('ENTERING rename-------------');
  if (!vscode.workspace.workspaceFolders?.length) return null;
  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

  const uri = resolveFilePath(instruction.file, root);
  const newUri = resolveFilePath(instruction.newName, root);
  await vscode.workspace.fs.rename(uri, newUri, { overwrite: true });

  return instruction.file;
};
