import * as vscode from 'vscode';

import { AIClient } from '../clients';
import { Context } from '../services';
import { INLINE_SUGGESTION_PROMPT, stripCodeFences } from '../utils';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastRequest: {
    resolve: (list: vscode.InlineCompletionList) => void;
    document: vscode.TextDocument;
    position: vscode.Position;
  } | null = null;

  constructor(
    private aiClient: AIClient,
    private ctx: Context,
  ) {}

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

        const before = this.getContextBeforeCursor(document, position);
        const after = this.getContextAfterCursor(document, position);

        const ctx = await this.ctx.getContext(before + after, {
          contextLimit: 5,
          lookUpFileTree: false,
        });

        const prompt = INLINE_SUGGESTION_PROMPT({ ...ctx, before, after });

        console.log('=========USER PROMPT=========', prompt);

        let suggestionText = '';
        try {
          suggestionText = await this.aiClient.autocomplete(prompt);
        } catch (e) {
          console.error('AI inline completion error:', e);
        }

        const item = suggestionText
          ? new vscode.InlineCompletionItem(
              new vscode.SnippetString(stripCodeFences(suggestionText)),
              new vscode.Range(position, position),
            )
          : null;

        resolve({ items: item ? [item] : [] });

        console.log('=======================AI-suggestion==============', suggestionText);

        this.debounceTimer = null;
        this.lastRequest = null;
      }, 3000);
    });
  }
}
