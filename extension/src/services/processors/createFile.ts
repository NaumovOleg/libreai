import { CreateToolArgs, ensureDirectory, resolveFilePath } from '@utils';
import * as vscode from 'vscode';

export const createFileCb = async (instruction: CreateToolArgs) => {
  const uri = resolveFilePath(instruction.file);

  try {
    await vscode.workspace.fs.stat(uri);
    throw new Error('File already exists.');
  } catch (e) {
    await ensureDirectory(uri);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(instruction.content ?? '', 'utf-8'));

    return instruction.file;
  }
};
