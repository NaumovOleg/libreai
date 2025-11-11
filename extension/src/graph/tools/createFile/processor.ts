import { CreateToolArgs, ensureDirectory, resolveFilePath } from '@utils';
import * as vscode from 'vscode';

export const processor = async (instruction: CreateToolArgs) => {
  const uri = resolveFilePath(instruction.file);

  try {
    await vscode.workspace.fs.stat(uri);
    throw new Error('File already exists.');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    await ensureDirectory(uri);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(instruction.content ?? '', 'utf-8'));

    return instruction.file;
  }
};
