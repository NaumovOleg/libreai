import { Conf, stripCodeFences } from '@utils';
import * as vscode from 'vscode';

import { Autocomplete } from '../ai';
import { Context } from '../services';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private debounceTimer: NodeJS.Timeout | null = null;
  private autocomplete = new Autocomplete();
  private lastRequest: {
    resolve: (list: vscode.InlineCompletionList) => void;
    document: vscode.TextDocument;
    position: vscode.Position;
  } | null = null;

  constructor(private ctx: Context) {}

  getContextBeforeCursor(
    document: vscode.TextDocument,
    position: vscode.Position,
    linesBefore = 20,
  ) {
    const startLine = Math.max(0, position.line - linesBefore);
    const range = new vscode.Range(startLine, 0, position.line, position.character);
    return document.getText(range);
  }

  getContextAfterCursor(document: vscode.TextDocument, position: vscode.Position, linesAfter = 20) {
    const endLine = Math.min(document.lineCount - 1, position.line + linesAfter);
    const range = new vscode.Range(
      position.line,
      position.character,
      endLine,
      document.lineAt(endLine).text.length,
    );
    return document.getText(range);
  }

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.InlineCompletionList> {
    const delay = Conf.autoCompleteConfig.autocompleteDeleay;

    if (!delay) return { items: [] };
    console.log('AUTOCOMPLETE TRIGGERED');
    return new Promise((resolve) => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.lastRequest = { resolve, document, position };
      this.debounceTimer = setTimeout(async () => {
        if (!this.lastRequest) return;

        const { resolve, document, position } = this.lastRequest;

        const before = this.getContextBeforeCursor(document, position, 20);
        const after = this.getContextAfterCursor(document, position, 20);

        const language = this.ctx.language;
        const suggestionText = await this.autocomplete.run({ language, before, after });

        const item = suggestionText
          ? new vscode.InlineCompletionItem(
              new vscode.SnippetString(stripCodeFences(suggestionText as string)),
              new vscode.Range(position, position),
            )
          : null;

        resolve({ items: item ? [item] : [] });

        this.debounceTimer = null;
        this.lastRequest = null;
      }, Conf.autoCompleteConfig.autocompleteDeleay);
    });
  }

  async triggerAutocomplete() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const { document, selection } = editor;
    const position = selection.active;

    const before = this.getContextBeforeCursor(document, position, 10);
    const after = this.getContextAfterCursor(document, position, 10);
    const language = this.ctx.language;

    const suggestionText = await this.autocomplete.run({ language, before, after });

    if (!suggestionText) {
      vscode.window.showInformationMessage('No AI suggestion available.');
      return;
    }

    const snippet = new vscode.SnippetString(stripCodeFences(suggestionText));
    await editor.insertSnippet(snippet, position);
  }
}
