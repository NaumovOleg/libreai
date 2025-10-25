import { CommandToolArgs } from '@utils';
import { execSync } from 'child_process';
import * as vscode from 'vscode';

export const commandCb = async (instruction: CommandToolArgs) => {
  if (!vscode.workspace.workspaceFolders?.length) return 'No workspace folder is open.';
  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

  const output = execSync(instruction.command, {
    cwd: root,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return output.trim();
};
