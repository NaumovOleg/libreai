import path from 'path';
import * as vscode from 'vscode';

import { EditFileToolArgs } from '../utils';
import { Editor } from './editor';

export class PreviewManager {
  private decorations: vscode.TextEditorDecorationType[] = [];
  root: string;

  constructor(private editor: Editor) {
    this.root = vscode.workspace?.workspaceFolders?.[0]?.uri?.fsPath ?? '';
  }

  static async createPreview(args: EditFileToolArgs): Promise<'accept' | 'reject'> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new Error('No workspace folder open');
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const filePath = path.join(workspacePath, args.file);

    const editor = await vscode.window.showTextDocument(vscode.Uri.file(filePath), {
      preview: false,
    });

    const manager = new PreviewManager(new Editor(args));
    return manager.showDiff(editor, args);
  }

  async showInsertMode(editor: vscode.TextEditor, args: EditFileToolArgs) {
    const newLines = args.content.split('\n');
    const startLine = args.startLine;
    const addedRanges: vscode.Range[] = [];

    for (let i = 1; i < newLines.length; i++) {
      const lineNum = startLine + i;
      addedRanges.push(
        new vscode.Range(new vscode.Position(lineNum, 0), new vscode.Position(lineNum, 0)),
      );
    }
    const addedDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(33, 181, 33, 0.24)',
      isWholeLine: true,
    });
    const deletedDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255,0,0,0.3)',
      isWholeLine: true,
    });
    await this.editor.apply(args);
    editor.setDecorations(addedDecoration, addedRanges);
    this.decorations.push(deletedDecoration, addedDecoration);
  }

  async showReplaceMode(editor: vscode.TextEditor, args: EditFileToolArgs) {
    const newLines = args.content.split('\n');
    const removedRanges: vscode.Range[] = [];
    const addedRanges: vscode.Range[] = [];

    for (let i = 0; i < newLines.length - 1; i++) {
      const lineNum = args.endLine + i;
      addedRanges.push(
        new vscode.Range(new vscode.Position(lineNum, 0), new vscode.Position(lineNum, 0)),
      );
    }

    for (let i = 0; i < args.endLine - args.startLine + 1; i++) {
      const lineNum = args.startLine + i;
      removedRanges.push(
        new vscode.Range(new vscode.Position(lineNum, 0), new vscode.Position(lineNum, 0)),
      );
    }

    const addedDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(33, 181, 33, 0.24)',
      isWholeLine: true,
    });

    const deletedDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255,0,0,0.3)',
      isWholeLine: true,
    });

    await this.editor.apply(args);
    editor.setDecorations(deletedDecoration, removedRanges);
    editor.setDecorations(addedDecoration, addedRanges);
    this.decorations.push(deletedDecoration, addedDecoration);
  }

  async showDiff(editor: vscode.TextEditor, args: EditFileToolArgs): Promise<'accept' | 'reject'> {
    this.clear();

    if (args.insertMode === 'insert') {
      await this.showInsertMode(editor, args);
    }
    if (args.insertMode === 'replace') {
      await this.showReplaceMode(editor, args);
    }

    const choice = await vscode.window.showInformationMessage(
      `Apply AI changes for task: ${args.file || ''}?`,
      '✅ Accept',
      '❌ Reject',
    );

    if (choice === '✅ Accept') {
      this.clear();
      await this.editor.save();
      return 'accept';
    } else {
      this.clear();
      return 'reject';
    }
  }

  clear() {
    this.decorations.forEach((d) => d.dispose());
    this.decorations = [];
  }
}
