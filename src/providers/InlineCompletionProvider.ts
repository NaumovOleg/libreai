import { INLINE_SUGGESTION_PROMPT } from '@utils';
import * as vscode from 'vscode';

import { AIClient } from '../clients';
import { gatherWorkspaceContext } from '../workspaceContext';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private aiClient: AIClient;
  private lastTimeout: NodeJS.Timeout | null = null;
  private pendingResolve: ((value: vscode.InlineCompletionList) => void) | null = null;

  constructor() {
    this.aiClient = AIClient.fromSettings();
  }

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.InlineCompletionList> {
    return new Promise((resolve) => {
      if (this.lastTimeout) clearTimeout(this.lastTimeout);
      this.pendingResolve = resolve;
      this.lastTimeout = setTimeout(async () => {
        const messages = INLINE_SUGGESTION_PROMPT({
          linePrefix: document.lineAt(position).text.slice(0, position.character),
          selection: document.getText(document.getWordRangeAtPosition(position)),
          workspaceContext: await gatherWorkspaceContext(6, 6000),
          language: document.languageId,
        });

        let suggestionText = '';
        try {
          suggestionText = await this.aiClient.triggerSuggestions(messages);
        } catch (e) {
          suggestionText = '';
          console.error('AI inline completion error:', e);
        }

        const item = suggestionText
          ? new vscode.InlineCompletionItem(
              new vscode.SnippetString(suggestionText),
              new vscode.Range(position, position),
            )
          : null;

        resolve({ items: item ? [item] : [] });

        this.lastTimeout = null;
        this.pendingResolve = null;
      }, 300);
    });
  }
}
