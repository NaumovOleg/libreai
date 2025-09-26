import * as vscode from 'vscode';

import { EditFileToolArgs, resolveFilePath } from '../utils';

export class Editor {
  document!: vscode.TextDocument;
  uri: vscode.Uri;

  constructor(private instruction: EditFileToolArgs) {
    const root = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath ?? '';

    this.uri = resolveFilePath(instruction.file, root);
  }

  async apply() {
    this.document = await vscode.workspace.openTextDocument(this.uri);

    const edit = new vscode.WorkspaceEdit();

    const fullRange = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(
        this.document.lineCount - 1,
        this.document.lineAt(this.document.lineCount - 1).text.length,
      ),
    );

    edit.replace(this.uri, fullRange, this.instruction.content);

    await vscode.workspace.applyEdit(edit);
    await this.document.save();

    return this.instruction.content;
  }
}
