import { DeleteFileToolArgs, resolveFilePath } from '@utils';
import * as vscode from 'vscode';

export const processor = async (instruction: DeleteFileToolArgs) => {
  const uri = resolveFilePath(instruction.file);

  await vscode.workspace.fs.delete(uri);

  return instruction.file;
};
