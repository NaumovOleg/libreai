import './assistant';

import { Db } from '@db';
import { foldersPattern, getWorkspaceFileTree } from '@utils';
import micromatch from 'micromatch';
import * as vscode from 'vscode';

import {
  AssistantProvider,
  ContextSelector,
  Icons,
  InlineCompletionProvider,
  QuickFix,
  ViewProvider,
} from './providers';
import { AgentSession, Context, Indexer } from './services';

export async function activate(context: vscode.ExtensionContext) {
  AgentSession.init(context);
  const db = Db.getInstance(context);
  const icons = new Icons();

  console.log(await getWorkspaceFileTree());

  await Promise.all([icons.initIcons(), db.init()]);

  const indexer = new Indexer(context, db);
  const ctx = new Context(db);

  const completions = new InlineCompletionProvider(ctx);
  const assistantProvider = new AssistantProvider();

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
    vscode.commands.registerCommand('robocode.openChat', () =>
      vscode.commands.executeCommand('robocodeView.focus'),
    ),
    vscode.commands.registerCommand(quiqFix.documentCodeCommand, (args) =>
      assistantProvider.callDocumentCode(args),
    ),

    vscode.commands.registerCommand(quiqFix.explainCommand, (args) =>
      assistantProvider.callExplain(args),
    ),
  );

  vscode.workspace.onDidChangeWorkspaceFolders(async () => indexer.onWorkspaceChange());

  vscode.workspace.onDidSaveTextDocument((ev) => {
    const filePath = ev.uri.fsPath;

    const isExcluded = micromatch.isMatch(filePath, foldersPattern, { dot: true });

    if (!isExcluded) {
      indexer.indexFile(ev.uri);
    }
  });
  vscode.workspace.onDidRenameFiles((ev) => {
    const remove: vscode.Uri[] = [];
    const index: vscode.Uri[] = [];

    ev.files.forEach(({ newUri, oldUri }) => {
      remove.push(oldUri);
      index.push(newUri);
    });
    indexer.deleteFiles(remove);
    Promise.all(index.map((f) => indexer.indexFile(f)));
  });
  vscode.workspace.onDidDeleteFiles((ev) => indexer.deleteFiles(Array.from(ev.files)));
}

export function deactivate() {}
