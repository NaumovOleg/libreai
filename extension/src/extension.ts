import { foldersPattern, getActiveWorkspaces } from '@utils';
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
import { Context, SessionStorage } from './services';
import { VectorStorage } from './services/database';

export async function activate(context: vscode.ExtensionContext) {
  const vectorizer = VectorStorage.getInstance(context);
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
    ctx.onWorkspaceChange();
  });

  vscode.workspace.onDidSaveTextDocument((ev) => {
    const filePath = ev.uri.fsPath;

    const isExcluded = micromatch.isMatch(filePath, foldersPattern, { dot: true });

    if (!isExcluded) {
      ctx.indexFile(ev.uri);
    }
  });
  vscode.workspace.onDidDeleteFiles((ev) => {
    ctx.deleteFiles(Array.from(ev.files));
  });
  console.log(getActiveWorkspaces());
}

export function deactivate() {}
