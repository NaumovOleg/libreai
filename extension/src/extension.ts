import './assistant';

import { Db } from '@db';
import { filePattern, foldersPattern } from '@utils';
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
const timersMap = new Map<string, NodeJS.Timeout | undefined>();
export async function activate(context: vscode.ExtensionContext) {
  AgentSession.init(context);
  const db = Db.getInstance(context);
  const icons = new Icons();

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

  const disposableChangeFile = vscode.workspace.onDidChangeTextDocument((ev) => {
    const filePath = ev.document.uri.fsPath;
    const timeout = timersMap.get(filePath);
    const folderMatch = micromatch.isMatch(filePath, foldersPattern, { dot: true });
    const fileMatch = micromatch.isMatch(filePath, filePattern, { dot: true });

    if (!fileMatch || folderMatch) return;
    if (timeout) clearTimeout(timeout);

    const timer = setTimeout(() => {
      indexer.indexFile(ev.document.uri);
    }, 2000);
    timersMap.set(filePath, timer);
  });

  context.subscriptions.push(
    chatView,
    inlineProvider,
    contextSelector.subscription,
    triggerAutocomplete,
    disposableChangeFile,

    vscode.languages.registerCodeActionsProvider(
      { pattern: '**' },
      quiqFix as vscode.CodeActionProvider,
      { providedCodeActionKinds: QuickFix.providedCodeActionKinds },
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

  // vscode.workspace.onDidSaveTextDocument(async (ev) => {
  //   const filePath = ev.uri.fsPath;

  //   const isExcluded = micromatch.isMatch(filePath, foldersPattern, { dot: true });

  //   if (!isExcluded) {
  //     await indexer.indexFile(ev.uri);
  //   }
  // });
  vscode.workspace.onDidRenameFiles(async (ev) => {
    await Promise.all(ev.files.map(({ newUri, oldUri }) => indexer.renameFile(newUri, oldUri)));
  });
  vscode.workspace.onDidDeleteFiles(async (ev) => await indexer.deleteFiles(Array.from(ev.files)));
}

export function deactivate() {}
