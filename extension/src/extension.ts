import * as vscode from 'vscode';

import { AIClient, SessionStorage } from './clients';
import { Icons, InlineCompletionProvider, ViewProvider } from './providers';
import { Context } from './services';
import { VectorizerClient } from './services/database';

export async function activate(context: vscode.ExtensionContext) {
  const vectorizer = new VectorizerClient(context);

  const oldContent = `const userList = [
  { id: 1, name: "User1", address: "" },
  { id: 2, name: "User2", address: "" },
  { id: 3, name: "User3", address: "" },
];

export const userService = {
  removedUsers: [],
  users: userList,

  editUser(): void {
    // console.log(args)
  },

  getUserList(): any[] {
    return this.users;
  },

  getUser(id: number): any | undefined {
    return this.users.find((user) => user.id === id);
  },
};
`;

  const content = `const userList = [
  { id: 1, name: "User1", address: "" },
  { id: 2, name: "User2", address: "" },
  { id: 3, name: "User3", address: "" },
];

const name = {}

export const userService = {
  removedUsers: [],
  users: userList,

  getUser(id: number): any | undefined {
    return this.users.find((user) => user.id === id);
  },
};
`;

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
