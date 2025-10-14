import * as vscode from 'vscode';

import {
  ContextSelector,
  Helper,
  Icons,
  InlineCompletionProvider,
  QuickFix,
  ViewProvider,
} from './providers';
import { Context, SessionStorage } from './services';
import { VectorStorage } from './services/database';

export async function activate(context: vscode.ExtensionContext) {
  const vectorizer = new VectorStorage(context);
  const ctx = new Context(vectorizer);
  const storage = new SessionStorage(context);
  const icons = new Icons();
  const completions = new InlineCompletionProvider(ctx);
  const helperProvider = new Helper();

  const contextSelector = new ContextSelector();

  await Promise.all([icons.initIcons(), vectorizer.init()]);
  const viewProvider = new ViewProvider(context.extensionUri, storage, ctx, icons, contextSelector);
  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: '**' },
    completions,
  );

  const chatView = vscode.window.registerWebviewViewProvider(ViewProvider.viewType, viewProvider);

  const quiqFix = new QuickFix();
  const triggerAutocomplete = vscode.commands.registerCommand('robocode.triggerAutocomplete', () =>
    completions.triggerAutocomplete(),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('robocode.openChat', () => {
      vscode.commands.executeCommand('robocodeView.focus');
    }),
    vscode.commands.registerCommand(quiqFix.documentCodeCommand, (args) => {
      helperProvider.callDocumentCode(args);
    }),

    vscode.commands.registerCommand(quiqFix.explainCommand, (args) => {
      helperProvider.callExplain(args);
    }),
    inlineProvider,
    chatView,
    contextSelector.subscription,
    triggerAutocomplete,

    vscode.languages.registerCodeActionsProvider(
      { pattern: '**' },
      quiqFix as vscode.CodeActionProvider,
      {
        providedCodeActionKinds: QuickFix.providedCodeActionKinds,
      },
    ),
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

  if (!(await ctx.isWorkspaceIndexed())) {
    ctx.indexWorkspace();
  }
}

export function deactivate() {}
