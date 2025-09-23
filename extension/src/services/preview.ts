import path from 'path';
import * as vscode from 'vscode';

export class PreviewManager {
  private decorations: vscode.TextEditorDecorationType[] = [];

  static async createPreview(file: string, newContent: string): Promise<'accept' | 'reject'> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new Error('No workspace folder open');
    }
    const workspacePath = workspaceFolders[0].uri.fsPath;

    const url = path.join(workspacePath, file);
    const editor = await vscode.window.showTextDocument(vscode.Uri.file(url), { preview: false });

    const manager = new PreviewManager();
    return manager.showDiff(editor, newContent);
  }

  async showDiff(editor: vscode.TextEditor, newContent: string): Promise<'accept' | 'reject'> {
    const oldText = editor.document.getText();

    this.clear();

    const deletedDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255,0,0,0.3)',
    });

    const addedDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(0,255,0,0.3)',
    });

    const oldRange = new vscode.Range(
      editor.document.positionAt(0),
      editor.document.positionAt(oldText.length),
    );

    const addedRange = new vscode.Range(
      new vscode.Position(0, 0),
      editor.document.positionAt(Math.min(newContent.length, 100)),
    );

    editor.setDecorations(deletedDecoration, [oldRange]);
    editor.setDecorations(addedDecoration, [addedRange]);

    this.decorations.push(deletedDecoration, addedDecoration);

    const choice = await vscode.window.showInformationMessage(
      'Apply AI changes?',
      '✅ Accept',
      '❌ Reject',
    );

    if (choice === '✅ Accept') {
      await this.applyChanges(editor, newContent);
      return 'accept';
    } else {
      this.clear();
      return 'reject';
    }
  }

  async applyChanges(editor: vscode.TextEditor, newContent: string) {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      editor.document.positionAt(0),
      editor.document.positionAt(editor.document.getText().length),
    );
    edit.replace(editor.document.uri, fullRange, newContent);
    await vscode.workspace.applyEdit(edit);
    this.clear();
  }

  clear() {
    this.decorations.forEach((d) => d.dispose());
    this.decorations = [];
  }
}
