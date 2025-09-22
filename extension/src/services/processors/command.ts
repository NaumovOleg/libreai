import { execSync } from 'child_process';
import * as vscode from 'vscode';

import { CommandToolArgs } from '../../utils';

export const commandCb = async (instruction: CommandToolArgs) => {
  if (!vscode.workspace.workspaceFolders?.length) return null;
  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

  try {
    if (!vscode.workspace.workspaceFolders?.length) {
      vscode.window.showErrorMessage('No workspace folder is open.');
      return;
    }

    return execSync(instruction.command, { cwd: root, encoding: 'utf-8' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    vscode.window.showErrorMessage(`Failed to execute command: ${instruction.command}`);
    return err.message;
  }
};
