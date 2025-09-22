import * as vscode from 'vscode';

import { EditFileToolArgs, resolveFilePath } from '../../utils';

export const editFileCb = async (instruction: EditFileToolArgs) => {
  console.log('ENTERING EDIT-------------');
  if (!vscode.workspace.workspaceFolders?.length) return null;
  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

  const uri = resolveFilePath(instruction.file, root);

  const document = await vscode.workspace.openTextDocument(uri);
  const edit = new vscode.WorkspaceEdit();

  const content = instruction.content;
  const startLine = instruction.startLine ?? 0;
  const endLine = instruction.endLine ?? startLine;

  const endPos = new vscode.Position(
    Math.min(endLine, document.lineCount - 1),
    document.lineAt(Math.min(endLine, document.lineCount - 1)).text.length,
  );

  if (instruction.insertMode === 'insert') {
    const startPos = new vscode.Position(startLine, 0);
    edit.insert(uri, startPos, content.replace(/^\n/, '') + '\n');
  } else if (instruction.insertMode === 'replace') {
    const startPos = new vscode.Position(startLine, 0);
    if (content === '' && endLine >= startLine) {
      const deleteRange = new vscode.Range(startPos, endPos);
      edit.delete(uri, deleteRange);
    } else {
      const replaceRange = new vscode.Range(startPos, endPos);
      edit.replace(uri, replaceRange, content);
    }
  }

  await vscode.workspace.applyEdit(edit);
  await document.save();
  return instruction.content;
};
