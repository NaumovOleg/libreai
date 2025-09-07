import * as vscode from 'vscode';

import { AIClient } from '../clients';
import { gatherWorkspaceContext, INLINE_SUGGESTION_PROMPT } from '../utils';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastRequest: {
    resolve: (list: vscode.InlineCompletionList) => void;
    document: vscode.TextDocument;
    position: vscode.Position;
  } | null = null;

  constructor(private aiClient: AIClient) {}

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

        const prompt = INLINE_SUGGESTION_PROMPT({
          linePrefix: document.lineAt(position).text.slice(0, position.character),
          selection: document.getText(document.getWordRangeAtPosition(position)),
          workspaceContext: await gatherWorkspaceContext(6, 6000),
          language: document.languageId,
        });

        console.log('=========USER PROMPT=========', prompt);

        let suggestionText = '';
        try {
          suggestionText = await this.aiClient.autocomplete(prompt);
        } catch (e) {
          console.error('AI inline completion error:', e);
        }
        console.log('=======================AI-suggestion==============', suggestionText);

        const item = suggestionText
          ? new vscode.InlineCompletionItem(
              new vscode.SnippetString(suggestionText),
              new vscode.Range(position, position),
            )
          : null;

        resolve({ items: item ? [item] : [] });

        this.debounceTimer = null;
        this.lastRequest = null;
      }, 3000);
    });
  }
}
