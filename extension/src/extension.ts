import * as vscode from 'vscode';

import { AIAgent } from './agents';
import { AIClient, SessionStorage } from './clients';
import { InlineCompletionProvider, ViewProvider } from './providers';

export async function activate(context: vscode.ExtensionContext) {
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

  //    vscode.workspace.onDidChangeWorkspaceFolders((event) => {
  //     console.log('Workspace folders changed!');
  //     if (event.added.length > 0) {
  //       console.log('Added folders:', event.added.map(f => f.name));
  //       reindexAll(); // Полная переиндексация при добавлении папки
  //     }
  //     if (event.removed.length > 0) {
  //       console.log('Removed folders:', event.removed.map(f => f.name));
  //       cleanupRemoved(event.removed);
  //     }
  //   });

  //   // === 2. Следим за изменением или созданием файлов ===
  //   const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*', false, false, false);

  //   fileWatcher.onDidCreate((uri) => {
  //     console.log('File created:', uri.fsPath);
  //     reindexFile(uri); // Индексируем новый файл
  //   });

  //   fileWatcher.onDidChange((uri) => {
  //     console.log('File changed:', uri.fsPath);
  //     reindexFile(uri); // Переиндексируем изменённый файл
  //   });

  //   fileWatcher.onDidDelete((uri) => {
  //     console.log('File deleted:', uri.fsPath);
  //     removeFromIndex(uri);
  //   });

  //   context.subscriptions.push(fileWatcher);
  // }

  // vscode.window.onDidChangeActiveTextEditor(async (editor) => {
  //   if (!editor) return;
  //   console.log(await 'aaaaaaaaaaaaaaaaaaaaaaaaa', ctx.getContext());
  //   // chatProvider.updateContext({ editor });
  // });

  context.subscriptions.push(inlineProvider, chatView);
}

export function deactivate() {}
