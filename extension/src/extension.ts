import { foldersPattern } from '@utils';
import micromatch from 'micromatch';
import * as vscode from 'vscode';
import {
  ContextSelector,
  Helper,
  Icons,
  InlineCompletionProvider,
  QuickFix,
  ViewProvider,
} from './providers';
import { Context, Indexer } from './services';

import { Db } from '@db';

export async function activate(context: vscode.ExtensionContext) {
  const db = Db.getInstance(context);
  const icons = new Icons();

  await Promise.all([icons.initIcons(), db.init()]);

  const indexer = new Indexer(context, db);
  const ctx = new Context(db);

  const completions = new InlineCompletionProvider(ctx);
  const helperProvider = new Helper();

  const contextSelector = new ContextSelector();

  const viewProvider = new ViewProvider(
    context.extensionUri,
    db,
    ctx,
    indexer,
    icons,
    contextSelector,
  );
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
    chatView,

    inlineProvider,
    contextSelector.subscription,
    triggerAutocomplete,

    vscode.languages.registerCodeActionsProvider(
      { pattern: '**' },
      quiqFix as vscode.CodeActionProvider,
      {
        providedCodeActionKinds: QuickFix.providedCodeActionKinds,
      },
    ),
    vscode.commands.registerCommand('robocode.openChat', () => {
      vscode.commands.executeCommand('robocodeView.focus');
    }),
    vscode.commands.registerCommand(quiqFix.documentCodeCommand, (args) => {
      helperProvider.callDocumentCode(args);
    }),

    vscode.commands.registerCommand(quiqFix.explainCommand, (args) => {
      helperProvider.callExplain(args);
    }),
  );

  vscode.workspace.onDidChangeWorkspaceFolders(async () => {
    indexer.onWorkspaceChange();
  });

  vscode.workspace.onDidSaveTextDocument((ev) => {
    const filePath = ev.uri.fsPath;

    const isExcluded = micromatch.isMatch(filePath, foldersPattern, { dot: true });

    if (!isExcluded) {
      indexer.indexFile(ev.uri);
    }
  });
  vscode.workspace.onDidDeleteFiles((ev) => {
    indexer.deleteFiles(Array.from(ev.files));
  });
}

export function deactivate() {}
