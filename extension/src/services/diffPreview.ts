import * as vscode from 'vscode';

import { ShowPreviewMessage } from '../utils';

class MemoryContentProvider implements vscode.TextDocumentContentProvider {
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  public readonly onDidChange = this._onDidChange.event;

  constructor(private content: string) {}

  updateContent(newContent: string) {
    this.content = newContent;
    this._onDidChange.fire(vscode.Uri.parse('memory://doc'));
  }

  provideTextDocumentContent(): string {
    return this.content;
  }
}

export async function showMemoryDiff(args: ShowPreviewMessage) {
  const oldUri = vscode.Uri.parse(`diff-old://${args.file}`);
  const newUri = vscode.Uri.parse(`diff-new://${args.file}`);

  const oldProvider = new MemoryContentProvider(args.old);
  const newProvider = new MemoryContentProvider(args.content);

  vscode.workspace.registerTextDocumentContentProvider('diff-old', oldProvider);
  vscode.workspace.registerTextDocumentContentProvider('diff-new', newProvider);

  await vscode.commands.executeCommand(
    'vscode.diff',
    oldUri,
    newUri,
    `Preview diff on file ${args.file}`,
  );
}
