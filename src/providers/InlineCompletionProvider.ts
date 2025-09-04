import { INLINE_SUGGESTION_PROMPT } from '@utils';
import * as vscode from 'vscode';

import { AIClient } from '../clients';
import { gatherWorkspaceContext } from '../workspaceContext';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private aiClient: AIClient;
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastRequest: {
    resolve: (list: vscode.InlineCompletionList) => void;
    document: vscode.TextDocument;
    position: vscode.Position;
  } | null = null;

  constructor() {
    this.aiClient = AIClient.fromSettings();
  }

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.InlineCompletionList> {
    return new Promise((resolve) => {
      // Сбрасываем предыдущий таймер
      if (this.debounceTimer) clearTimeout(this.debounceTimer);

      // Сохраняем последний запрос
      this.lastRequest = { resolve, document, position };

      // Debounce 300ms
      this.debounceTimer = setTimeout(async () => {
        if (!this.lastRequest) return;

        const { resolve, document, position } = this.lastRequest;

        const prompt = INLINE_SUGGESTION_PROMPT({
          linePrefix: document.lineAt(position).text.slice(0, position.character),
          selection: document.getText(document.getWordRangeAtPosition(position)),
          workspaceContext: await gatherWorkspaceContext(6, 6000),
          language: document.languageId,
        });

        let suggestionText = '';
        try {
          suggestionText = await this.aiClient.triggerSuggestions(prompt);
        } catch (e) {
          console.error('AI inline completion error:', e);
        }

        const item = suggestionText
          ? new vscode.InlineCompletionItem(
              new vscode.SnippetString(suggestionText),
              new vscode.Range(position, position),
            )
          : null;

        resolve({ items: item ? [item] : [] });

        // Сбрасываем
        this.debounceTimer = null;
        this.lastRequest = null;
      }, 300);
    });
  }
}
