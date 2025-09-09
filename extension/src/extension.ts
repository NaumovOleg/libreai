import * as vscode from 'vscode';

import { AIAgent } from './agents';
import { AIClient, SessionStorage } from './clients';
import { InlineCompletionProvider, ViewProvider } from './providers';

export function activate(context: vscode.ExtensionContext) {
  console.log('AI Extension is now active!');
  const client = new AIClient();
  const storage = new SessionStorage(context);

  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: '**' },
    new InlineCompletionProvider(client),
  );

  const agent = new AIAgent(client);

  const chatProvider = new ViewProvider(context.extensionUri, client, agent, storage);

  const chatView = vscode.window.registerWebviewViewProvider(ViewProvider.viewType, chatProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('libreChat.openChat', () => {
      vscode.commands.executeCommand('libreChatView.focus');
    }),
  );

  vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (!editor) return;
    console.log(await 'aaaaaaaaaaaaaaaaaaaaaaaaa', ctx.getContext());
    // chatProvider.updateContext({ editor });
  });

  context.subscriptions.push(inlineProvider, chatView);
}

export function deactivate() {}
