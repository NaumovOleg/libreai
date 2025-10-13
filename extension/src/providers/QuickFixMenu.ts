import * as vscode from 'vscode';

export class QuickFix {
  public documentCode = new vscode.CodeAction('Robocode: document', vscode.CodeActionKind.QuickFix);
  public explain = new vscode.CodeAction('Robocode: explain', vscode.CodeActionKind.QuickFix);
  public documentCodeCommand = 'robocode.documentCode';
  public explainCommand = 'robocode.explainCode';

  constructor() {
    this.documentCode.command = { title: 'Document', command: this.documentCodeCommand };
    this.explain.command = { title: 'Explain', command: this.explainCommand };
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    const args = { arguments: [document, range] };
    Object.assign(this.documentCode.command!, args);
    Object.assign(this.explain.command!, args);

    return [this.documentCode, this.explain];
  }
  static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];
}
