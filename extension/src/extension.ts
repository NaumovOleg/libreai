import * as vscode from 'vscode';

import { ChatProvider, InlineCompletionProvider } from './providers';

export function activate(context: vscode.ExtensionContext) {
  console.log('AI Extension is now active!');

  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: '**' },
    new InlineCompletionProvider(),
  );

  const chatProvider = new ChatProvider(context.extensionUri, context);

  const chatView = vscode.window.registerWebviewViewProvider(ChatProvider.viewType, chatProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('libreChat.openChat', () => {
      vscode.commands.executeCommand('libreChatView.focus');
    }),
  );

  context.subscriptions.push(inlineProvider, chatView);
}

export function deactivate() {}
