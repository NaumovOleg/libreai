import * as vscode from 'vscode';

import { Agent } from './agents';
import { AIClient, SessionStorage } from './clients';
import { Icons, InlineCompletionProvider, ViewProvider } from './providers';
import { Context, DatabaseClient } from './services';

export async function activate(context: vscode.ExtensionContext) {
  const client = new AIClient();
  const storage = new SessionStorage(context);
  const db = new DatabaseClient(context);
  const ctx = new Context(db);
  const icons = new Icons();
  await Promise.all([icons.initIcons(), db.init()]);

  ctx.indexWorkspace();

  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: '**' },
    new InlineCompletionProvider(client, ctx),
  );

  const agent = new Agent(client);
  const chatProvider = new ViewProvider(context.extensionUri, client, agent, storage, ctx, icons);
  const chatView = vscode.window.registerWebviewViewProvider(ViewProvider.viewType, chatProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('libreChat.openChat', () => {
      vscode.commands.executeCommand('libreChatView.focus');
    }),
  );

  vscode.workspace.onDidChangeWorkspaceFolders(() => {
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
