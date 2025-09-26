import * as vscode from 'vscode';

import { AIClient, SessionStorage } from './clients';
import { Icons, InlineCompletionProvider, ViewProvider } from './providers';
import { Context } from './services';
import { VectorizerClient } from './services/database';

// {
//     "file": "services/userService.ts",
//     "instructions": [
//         {
//             "startLine": 9,
//             "endLine": 9,
//             "insertMode": "insert",
//             "content": "  deleteUser(id: number): void {\\n    const userIndex = this.users.findIndex(user => user.id === id);\\n    if (userIndex !== -1) {\\n      const [removedUser] = this.users.splice(userIndex, 1);\\n      this.removedUsers.push(removedUser);\\n    }\\n  },\\n"
//         }
//     ]
// }

export async function activate(context: vscode.ExtensionContext) {
  const vectorizer = new VectorizerClient(context);

  const client = new AIClient();
  const storage = new SessionStorage(context);
  const icons = new Icons();
  await Promise.all([icons.initIcons(), vectorizer.init()]);

  const ctx = new Context(vectorizer);
  await ctx.indexWorkspace();

  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: '**' },
    new InlineCompletionProvider(client, ctx),
  );
  const chatProvider = new ViewProvider(context.extensionUri, storage, ctx, icons);
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
