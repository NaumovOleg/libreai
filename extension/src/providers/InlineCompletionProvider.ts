import * as vscode from 'vscode';

import { Autocomplete } from '../ai';
import { Context } from '../services';
import { stripCodeFences } from '../utils';

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
    linesBefore = 3,
  ) {
    const startLine = Math.max(0, position.line - linesBefore);
    const range = new vscode.Range(startLine, 0, position.line, position.character);
    return document.getText(range);
  }

  getContextAfterCursor(document: vscode.TextDocument, position: vscode.Position, linesAfter = 3) {
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
    return new Promise((resolve) => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.lastRequest = { resolve, document, position };
      this.debounceTimer = setTimeout(async () => {
        if (!this.lastRequest) return;

        const { resolve, document, position } = this.lastRequest;

        const before = this.getContextBeforeCursor(document, position, 10);
        const after = this.getContextAfterCursor(document, position, 10);

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
      }, 3000);
    });
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const action = new vscode.CodeAction('Trigger AI Autocomplete', vscode.CodeActionKind.QuickFix);

    action.command = {
      title: 'Trigger AI Autocomplete',
      command: 'myExtension.triggerAutocomplete',
      arguments: [document, range],
    } as vscode.Command;

    return [action];
  }
  static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];
}
