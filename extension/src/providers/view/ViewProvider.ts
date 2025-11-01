import { Chat, Workflow } from '@ai';
import { Observer } from '@observer';
import { callbacks, Context, Indexer, showMemoryDiff } from '@services';
import { Author, ChatMessage, COMMANDS, Conf, MESSAGE, ShowPreviewMessage, uuid } from '@utils';
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { ContextSelector } from '../ContextSelector';
import { Icons } from '../Icons';
import {
  interactCommand,
  onReceiveUserMessage,
  onStartMessages,
  selectContextFiles,
  useAgent as useAgentHelper,
} from './ViewProviderHelpers';

import { Db } from '@db';

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'robocodeView';
  private mediaFolder = 'out/view';
  private web!: vscode.WebviewView;
  private workflow: Workflow;
  private chat: Chat;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private database: Db,
    private ctx: Context,
    private indexer: Indexer,
    private icons: Icons,
    private contextSelector: ContextSelector,
  ) {
    this.workflow = new Workflow(callbacks);
    this.chat = new Chat();
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this.web = webviewView;
    this.web.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this.extensionUri.fsPath, 'out', 'view')),
        vscode.Uri.file(path.join(this.icons.extensionPath, 'icons')),
      ],
    };

    this.web.webview.onDidReceiveMessage(
      (message) => this.onDidReceiveMessage(message),
      undefined,
      [],
    );

    const htmlPath = path.join(this.extensionUri.fsPath, 'out', 'view', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');
    const observer = Observer.getInstance();
    observer.init(this.web);

    const iconsMap = this.icons.getIcons(this.web);
    html = html
      .replace(
        /href=\"\/index\.css\"/,
        `href=${webviewView.webview.asWebviewUri(
          vscode.Uri.file(path.join(this.extensionUri.fsPath, this.mediaFolder, 'index.css')),
        )}`,
      )
      .replace(
        /src=\"\/index\.js\"/,
        `src=${webviewView.webview.asWebviewUri(
          vscode.Uri.file(path.join(this.extensionUri.fsPath, this.mediaFolder, 'index.js')),
        )}`,
      )
      .replace(
        '</head>',
        `<script>window.ICONS_PATHS = ${JSON.stringify(iconsMap)};</script></head>`,
      );

    this.web.webview.html = html;
  }

  private async useChat(message: ChatMessage) {
    try {
      const payload = {
        from: Author.chat,
        to: Author.user,
        time: new Date(),
        text: '',
        id: uuid(7),
      };

      const [ctx, files] = await Promise.all([
        this.ctx.getContext(message.text, { contextLimit: 5 }),
        this.ctx.getFilesContent(message.files),
      ]);

      const chatGenerator = this.chat.chatStream({
        ...ctx,
        text: message.text,
        history: this.database.history,
        files,
      });

      for await (const chunk of chatGenerator) {
        payload.text += chunk;
        this.web.webview.postMessage({ type: COMMANDS.chatStream, payload });
      }

      this.web.webview.postMessage({ type: COMMANDS.chatStreamEnd });
      await this.database.addChatHistoryItems([message, payload]);
    } catch (err: any) {
      vscode.window.showErrorMessage(err.message);
    }
  }

  private async configListenerMounted() {
    await Promise.all([this.indexer.onWorkspaceChange(), onStartMessages(this.web)]);
  }

  private async onDidReceiveMessage(message: MESSAGE) {
    if (message.command === COMMANDS.changeConfig) {
      await Conf.updateConfig(message);
    }
    if (message.command === COMMANDS.removeChatSession) {
      await this.database.clearHistory();
    }

    if (message.command === COMMANDS.configListenerMounted) {
      this.configListenerMounted();
    }
    if (message.command === COMMANDS.showPreview) {
      showMemoryDiff(message.value as ShowPreviewMessage);
    }
    if (message.command === COMMANDS.indexing) {
      this.onWorkspaceIndexRequest(message.value as string);
    }
    if (message.command === COMMANDS.selectContext) {
      this.selectContextFiles();
    }
    if (message.command === COMMANDS.interactCommand) {
      interactCommand(message.value as any);
    }

    const value = message.value as ChatMessage;

    if (message.command === COMMANDS.sendMessage) {
      await onReceiveUserMessage(value, this.useChat.bind(this), this.useAgent.bind(this));
    }

    if (message.command === COMMANDS.restoreAgentSession) {
      const observer = Observer.getInstance();
      observer.restoreAgentSession();
    }
  }

  public onWorkspaceIndexRequest(workspace?: string) {
    if (!workspace) {
      return this.indexer.checkAndIndexWorkspace(true);
    }
    return this.indexer.indexWorkspace(workspace);
  }

  public async selectContextFiles() {
    await selectContextFiles(this.contextSelector, this.web);
  }

  public async useAgent(message: ChatMessage) {
    return useAgentHelper(message, this.ctx, this.workflow);
  }
}
