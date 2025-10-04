import { execSync } from 'child_process';
import * as vscode from 'vscode';

import { CommandToolArgs } from '../../utils';

export const commandCb = async (instruction: CommandToolArgs) => {
  if (!vscode.workspace.workspaceFolders?.length) return null;
  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

  if (!vscode.workspace.workspaceFolders?.length) {
    vscode.window.showErrorMessage('No workspace folder is open.');
    return;
  }

  return execSync(instruction.command, { cwd: root, encoding: 'utf-8' });
};
