import { HelperAi } from '@ai';
import { Editor } from '@services';
import * as vscode from 'vscode';

export class Helper {
  private helperAi: HelperAi;

  constructor() {
    this.helperAi = new HelperAi();
  }

  public callExplain(args) {
    console.log('callExplain', args);
  }

  public async callDocumentCode(data: { fileName: string; language: string }) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showWarningMessage('Please select code!');
      return;
    }

    const response = await this.helperAi.document(
      {
        code: editor?.document.getText(editor.selection),
        language: data.language,
      },
      false,
    );

    return Editor.insertBeforeSelection(response.toString() + '\n', selection.start);
  }
}
