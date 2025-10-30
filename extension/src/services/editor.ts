import { EditFileToolArgs, resolveFilePath } from '@utils';
import * as vscode from 'vscode';

export class Editor {
  document!: vscode.TextDocument;
  uri!: vscode.Uri;

  constructor(private instruction: EditFileToolArgs) {}

  async apply(instruction: EditFileToolArgs = this.instruction) {
    this.uri = resolveFilePath(instruction.file);

    this.document = await vscode.workspace.openTextDocument(this.uri);
    const edit = new vscode.WorkspaceEdit();
    const old = this.document.getText();

    const start = new vscode.Position(0, 0);
    const end =
      this.document.lineCount > 0
        ? this.document.lineAt(this.document.lineCount - 1).range.end
        : new vscode.Position(0, 0);

    edit.replace(this.uri, new vscode.Range(start, end), instruction.content);

    await vscode.workspace.applyEdit(edit);
    await vscode.window.showTextDocument(this.uri, { preview: false });
    await vscode.commands.executeCommand('workbench.action.files.save');
    this.document = await vscode.workspace.openTextDocument(this.uri);

    const content = this.document.getText();
    return { ...instruction, old, content };
  }

  static async insertBeforeSelection(text: string, start: vscode.Position) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    return editor.edit((editBuilder) => {
      editBuilder.insert(start, text);
    });
  }

  async save(instruction?: EditFileToolArgs) {
    await vscode.commands.executeCommand('editor.action.revert', this.uri);
    await this.apply(instruction ?? this.instruction);
    await vscode.commands.executeCommand('workbench.action.files.save');
    return this.document.save();
  }
}
