import * as vscode from 'vscode';

import { DeleteFileToolArgs, resolveFilePath } from '../../utils';

export const deleteFileCb = async (instruction: DeleteFileToolArgs) => {
  if (!vscode.workspace.workspaceFolders?.length) return null;
  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

  const uri = resolveFilePath(instruction.file, root);

  await vscode.workspace.fs.delete(uri);

  return instruction.file;
};
