import * as vscode from 'vscode';

import { EditFileToolArgs, resolveFilePath } from '../utils';

// type Action = {
//   edit: vscode.WorkspaceEdit;
//   instruction: EditFileToolArgs;
//   document: vscode.TextDocument;
//   uri: vscode.Uri;
// };

export class Editor {
  document!: vscode.TextDocument;
  uri!: vscode.Uri;

  constructor(private instruction: EditFileToolArgs) {}

  async apply(instruction: EditFileToolArgs = this.instruction) {
    if (!vscode.workspace.workspaceFolders?.length) return null;
    const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

    this.uri = resolveFilePath(instruction.file, root);

    this.document = await vscode.workspace.openTextDocument(this.uri);
    const edit = new vscode.WorkspaceEdit();
    const old = this.document.getText();

    // Заменяем весь документ целиком
    const start = new vscode.Position(0, 0);
    const end = this.document.lineAt(this.document.lineCount - 1).range.end;

    edit.replace(this.uri, new vscode.Range(start, end), instruction.content);

    await vscode.workspace.applyEdit(edit);
    return { ...instruction, old };
  }

  // async applyRange(instruction: EditFileToolArgs = this.instruction) {
  //   if (!vscode.workspace.workspaceFolders?.length) return null;
  //   const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

  //   this.uri = resolveFilePath(instruction.file, root);

  //   this.document = await vscode.workspace.openTextDocument(this.uri);

  //   const edit = new vscode.WorkspaceEdit();

  //   const data = { instruction, edit, document: this.document, uri: this.uri };

  //   if (this.instruction.insertMode === 'insert') {
  //     return this.insert(data);
  //   }
  //   if (this.instruction.insertMode === 'replace') {
  //     return this.replace(data);
  //   }
  //   return this.delete(data);
  // }

  // async insert(action: Action) {
  //   const { instruction, document, edit, uri } = action;

  //   const content = instruction.content;
  //   const startLine = instruction.startLine ?? 0;

  //   const lineText = document.lineAt(startLine).text; // получаем весь текст строки
  //   const endCharacter = lineText.length;

  //   const startPos = new vscode.Position(startLine, endCharacter ?? 0);
  //   edit.insert(uri, startPos, content + '\n');

  //   await vscode.workspace.applyEdit(edit);

  //   return instruction.content;
  // }

  // async replace(action: Action) {
  //   const { instruction, document, edit, uri } = action;

  //   const content = instruction.content;
  //   const startLine = instruction.startLine ?? 0;
  //   const endLine = instruction.endLine ?? startLine;

  //   const endPos = new vscode.Position(
  //     Math.min(endLine, document.lineCount - 1),
  //     document.lineAt(Math.min(endLine, document.lineCount - 1)).text.length,
  //   );

  //   const startPos = new vscode.Position(startLine, 0);

  //   const replaceRange = new vscode.Range(startPos, endPos);
  //   edit.replace(uri, replaceRange, content);

  //   await vscode.workspace.applyEdit(edit);

  //   return instruction.content;
  // }

  // async delete(action: Action) {
  //   const { instruction, document, edit, uri } = action;
  //   const startLine = instruction.startLine ?? 0;
  //   const endLine = instruction.endLine ?? startLine;
  //   const startPos = new vscode.Position(startLine, 0);
  //   const endPos = new vscode.Position(
  //     Math.min(endLine, document.lineCount - 1),
  //     document.lineAt(Math.min(endLine, document.lineCount - 1)).text.length,
  //   );

  //   const deleteRange = new vscode.Range(startPos, endPos);
  //   edit.delete(uri, deleteRange);

  //   await vscode.workspace.applyEdit(edit);

  //   return instruction.content;
  // }

  async save(instruction?: EditFileToolArgs) {
    await vscode.commands.executeCommand('editor.action.revert', this.uri);
    await this.apply(instruction ?? this.instruction);
    return this.document.save();
  }
}
