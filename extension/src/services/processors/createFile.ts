import { CreateToolArgs, ensureDirectory, resolveFilePath } from '@utils';
import * as vscode from 'vscode';

export const createFileCb = async (instruction: CreateToolArgs) => {
  const uri = resolveFilePath(instruction.file);

  await ensureDirectory(uri);
  await vscode.workspace.fs.writeFile(uri, Buffer.from(instruction.content ?? '', 'utf-8'));

  return instruction.file;
};
