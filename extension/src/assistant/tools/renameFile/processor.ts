import { RenameFileToolArgs, resolveFilePath } from '@utils';
import * as vscode from 'vscode';

export const processor = async (instruction: RenameFileToolArgs) => {
  const uri = resolveFilePath(instruction.file);
  const newUri = resolveFilePath(instruction.newName);
  await vscode.workspace.fs.rename(uri, newUri, { overwrite: true });

  return { renamed: newUri };
};
