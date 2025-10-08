import * as vscode from 'vscode';

import { Icons, InlineCompletionProvider, ViewProvider } from './providers';
import { Context, SessionStorage } from './services';
import { VectorizerClient } from './services/database';

export async function activate(context: vscode.ExtensionContext) {
  const vectorizer = new VectorizerClient(context);

  const storage = new SessionStorage(context);
  const icons = new Icons();
  await Promise.all([icons.initIcons(), vectorizer.init()]);

  const ctx = new Context(vectorizer);

  const chatProvider = new ViewProvider(context.extensionUri, storage, ctx, icons);
  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: '**' },
    new InlineCompletionProvider(ctx),
  );
  const chatView = vscode.window.registerWebviewViewProvider(ViewProvider.viewType, chatProvider);
  context.subscriptions.push(
    vscode.commands.registerCommand('libreChat.openChat', () => {
      vscode.commands.executeCommand('libreChatView.focus');
    }),
  );
  vscode.workspace.onDidChangeWorkspaceFolders(() => {
    console.log('workpsace filder change ');
    ctx.indexWorkspace();
  });
  vscode.workspace.onDidSaveTextDocument((ev) => {
    ctx.indexFile(ev.uri);
  });
  vscode.workspace.onDidDeleteFiles((ev) => {
    ctx.deleteFiles(Array.from(ev.files));
  });
  context.subscriptions.push(inlineProvider, chatView);
}

export function deactivate() {}
