import path from 'path';
import * as vscode from 'vscode';

import { EditFileToolArgs } from '../utils';

const deletedDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(255,0,0,0.3)',
});

const addedDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(0,255,0,0.3)',
});

export class PreviewManager {
  private decorations: vscode.TextEditorDecorationType[] = [];

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

    const manager = new PreviewManager();
    return manager.showDiff(editor, args);
  }

  async showDiff(editor: vscode.TextEditor, args: EditFileToolArgs): Promise<'accept' | 'reject'> {
    this.clear();

    const deletedDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255,0,0,0.3)',
      isWholeLine: true,
    });

    const addedDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(0,255,0,0.3)',
      isWholeLine: true,
    });

    const deletedRanges: vscode.Range[] = [];
    const addedRanges: vscode.Range[] = [];

    const startLine = args.startLine;
    const endLine = args.endLine;
    const newLines = args.content.split('\n');

    if (args.insertMode === 'replace') {
      // Подсветка удаляемого текста
      for (let i = startLine; i <= endLine; i++) {
        deletedRanges.push(
          new vscode.Range(
            new vscode.Position(i, 0),
            new vscode.Position(i, editor.document.lineAt(i).text.length),
          ),
        );
      }
      // Подсветка нового текста на месте старого
      for (let i = 0; i < newLines.length; i++) {
        const lineNum = startLine + i;
        const lineLength = editor.document.lineAt(lineNum)?.text.length || 0;
        addedRanges.push(
          new vscode.Range(
            new vscode.Position(lineNum, 0),
            new vscode.Position(lineNum, lineLength),
          ),
        );
      }
    } else {
      // insert mode → только зелёный
      for (let i = 0; i < newLines.length; i++) {
        const lineNum = startLine + i;
        addedRanges.push(
          new vscode.Range(new vscode.Position(lineNum, 0), new vscode.Position(lineNum, 0)),
        );
      }
    }

    editor.setDecorations(deletedDecoration, deletedRanges);
    editor.setDecorations(addedDecoration, addedRanges);
    this.decorations.push(deletedDecoration, addedDecoration);

    const choice = await vscode.window.showInformationMessage(
      `Apply AI changes for task: ${args.taskId || ''}?`,
      '✅ Accept',
      '❌ Reject',
    );

    if (choice === '✅ Accept') {
      await this.applyChanges(editor, args);
      return 'accept';
    } else {
      this.clear();
      return 'reject';
    }
  }

  async applyChanges(editor: vscode.TextEditor, args: EditFileToolArgs) {
    const edit = new vscode.WorkspaceEdit();
    const startPos = new vscode.Position(args.startLine, 0);
    const endPos = new vscode.Position(
      args.endLine,
      editor.document.lineAt(args.endLine).text.length,
    );
    const range = new vscode.Range(startPos, endPos);

    switch (args.insertMode) {
      case 'replace':
        edit.replace(editor.document.uri, range, args.content);
        break;
      case 'insertBefore':
        edit.insert(editor.document.uri, startPos, args.content + '\n');
        break;
      case 'insertAfter':
        edit.insert(editor.document.uri, endPos, '\n' + args.content);
        break;
    }

    await vscode.workspace.applyEdit(edit);
    this.clear();
  }

  clear() {
    this.decorations.forEach((d) => d.dispose());
    this.decorations = [];
  }
}
