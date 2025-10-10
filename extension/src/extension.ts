import * as vscode from 'vscode';

import { ContextSelector, Icons, InlineCompletionProvider, ViewProvider } from './providers';
import { Context, SessionStorage } from './services';
import { VectorStorage } from './services/database';

export async function activate(context: vscode.ExtensionContext) {
  const vectorizer = new VectorStorage(context);
  const storage = new SessionStorage(context);
  const icons = new Icons();
  const contextSelector = new ContextSelector();
  const ctx = new Context(vectorizer);
  await Promise.all([icons.initIcons(), vectorizer.init()]);
  const chatProvider = new ViewProvider(context.extensionUri, storage, ctx, icons, contextSelector);
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
  vscode.workspace.onDidChangeWorkspaceFolders(async () => {
    if (!(await ctx.isWorkspaceIndexed())) {
      ctx.indexWorkspace();
    }
  });
  vscode.workspace.onDidSaveTextDocument((ev) => {
    ctx.indexFile(ev.uri);
  });
  vscode.workspace.onDidDeleteFiles((ev) => {
    ctx.deleteFiles(Array.from(ev.files));
  });
  context.subscriptions.push(inlineProvider, chatView, contextSelector.subscription);
  if (!(await ctx.isWorkspaceIndexed())) {
    ctx.indexWorkspace();
  }

  setTimeout(() => {
    ctx.isWorkspaceIndexed();
  }, 3000);
}

export function deactivate() {}
