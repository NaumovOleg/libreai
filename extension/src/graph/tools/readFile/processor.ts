import { resolveFilePath } from '@utils';
import * as vscode from 'vscode';

export const processor = async (file: string) => {
  const fileUri = resolveFilePath(file);

  const fileData = await vscode.workspace.fs.readFile(fileUri);
  return Buffer.from(fileData).toString('utf-8');
};
