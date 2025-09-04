import * as vscode from 'vscode';

import { ChatViewProvider } from './providers/ChatViewProvider';
import { InlineCompletionProvider } from './providers/InlineCompletionProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('AI Extension is now active!');

  // Регистрируем провайдер для inline автодополнений
  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: '**' },
    new InlineCompletionProvider(),
  );

  // Регистрируем веб-панель с чатом
  const chatProvider = new ChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatProvider),
  );

  // Добавляем кнопку в панель
  const disposable = vscode.commands.registerCommand('ai-extension.helloWorld', () => {
    vscode.window.showInformationMessage('AI Extension работает!');
  });

  context.subscriptions.push(disposable, inlineProvider);
}

export function deactivate() {}
