import { DeleteFileToolArgs, resolveFilePath } from '@utils';
import * as vscode from 'vscode';

export const deleteFileCb = async (instruction: DeleteFileToolArgs) => {
  const uri = resolveFilePath(instruction.file);

  await vscode.workspace.fs.delete(uri);

  return instruction.file;
};
