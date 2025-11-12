import { Assistant } from '@assistant';
import { Observer } from '@observer';
import { Editor } from '@services';
import { Author, COMMANDS, getFileContent, getSelectionText, uuid } from '@utils';
import * as vscode from 'vscode';

export class AssistantProvider {
  private assistant: Assistant;

  constructor() {
    this.assistant = new Assistant();
  }

  public async callExplain(args: { uri: vscode.Uri; languageId: string }) {
    const [selection, content] = await Promise.all([
      getSelectionText(),
      getFileContent(args.uri.fsPath),
    ]);
    const observer = Observer.getInstance();

    observer.emit(COMMANDS.helperMessage, {
      from: Author.user,
      to: Author.chat,
      time: new Date(),
      text: `Explain code snippet: \n \`\`\` ${args.languageId} \n${selection}`,
      id: uuid(7),
    });

    const generator = this.assistant.explain({
      language: args.languageId,
      content,
      selection,
    });

    const payload = {
      from: Author.chat,
      to: Author.user,
      time: new Date(),
      text: '',
      id: uuid(7),
    };
    observer.emit(COMMANDS.chatStream, payload);
    for await (const chunk of generator) {
      payload.text += chunk;
      observer.emit(COMMANDS.chatStream, payload);
    }
    observer.emit(COMMANDS.chatStreamEnd);
  }

  public async callDocumentCode(data: { fileName: string; language: string }) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showWarningMessage('Please select code!');
      return;
    }

    const response = await this.assistant.document(
      {
        code: editor?.document.getText(editor.selection),
        language: data.language,
      },
      false,
    );

    return Editor.insertBeforeSelection(response.toString() + '\n', selection.start);
  }
}
