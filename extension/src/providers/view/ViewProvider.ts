import { Chat, Cursor } from '@ai';
import { Observer } from '@observer';
import { callbacks, Context, SessionStorage, showMemoryDiff } from '@services';
import {
  Author,
  ChatMessage,
  COMMANDS,
  Conf,
  CONFIG_PARAGRAPH,
  ExecCommandPayload,
  MESSAGE,
  ShowPreviewMessage,
  uuid,
} from '@utils';
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

import { ContextSelector } from '../ContextSelector';
import { Icons } from '../Icons';

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'libreChatView';
  private mediaFolder = 'out/view';
  private web!: vscode.WebviewView;
  private cursor: Cursor;
  private chat: Chat;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private storage: SessionStorage,
    private ctx: Context,
    private icons: Icons,
    private contextSelector: ContextSelector,
  ) {
    this.cursor = new Cursor(callbacks);
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
        /href="\/index\.css"/,
        `href="${webviewView.webview.asWebviewUri(
          vscode.Uri.file(path.join(this.extensionUri.fsPath, this.mediaFolder, 'index.css')),
        )}"`,
      )
      .replace(
        /src="\/index\.js"/,
        `src="${webviewView.webview.asWebviewUri(
          vscode.Uri.file(path.join(this.extensionUri.fsPath, this.mediaFolder, 'index.js')),
        )}"`,
      )
      .replace(
        '</head>',
        `<script>window.ICONS_PATHS = ${JSON.stringify(iconsMap)};</script></head>`,
      );

    this.web.webview.html = html;
    this.startIndexingWorkspace();
  }

  private onStartMessages() {
    return this.web.webview.postMessage({
      type: COMMANDS.changeConfig,
      payload: {
        [CONFIG_PARAGRAPH.chatConfig]: Conf.chatConfig,
        [CONFIG_PARAGRAPH.autoCompleteConfig]: Conf.autoCompleteConfig,
        [CONFIG_PARAGRAPH.agentConfig]: Conf.agentConfig,
      },
    });
  }

  private onReceiveUserMessage(message: ChatMessage) {
    if (message.to == Author.chat) {
      return this.useChat(message);
    }
    if (message.to == Author.agent) {
      return this.useAgent(message);
    }
  }

  private async useChat(message: ChatMessage) {
    try {
      const payload = {
        from: Author.chat,
        to: Author.user,
        time: new Date(),
        text: '',
        id: uuid(7),
        session: message.session,
      };

      const [ctx, files] = await Promise.all([
        this.ctx.getContext(message.text, { contextLimit: 5 }),
        this.ctx.getFilesContent(message.files),
      ]);
      const history = this.storage.getSessionChatHistory(message.session);
      const chatGenerator = this.chat.chatStream({
        ...ctx,
        text: message.text,
        history,
        files,
      });

      for await (const chunk of chatGenerator) {
        payload.text += chunk;
        this.web.webview.postMessage({ type: COMMANDS.chatStream, payload });
      }

      this.web.webview.postMessage({ type: COMMANDS.chatStreamEnd });
      await this.storage.addChatHistoryItems([message, payload]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
    }
  }

  private async startIndexingWorkspace(force = false) {
    if (force) {
      return this.ctx.indexWorkspace();
    }
    const isIndexed = await this.ctx.isWorkspaceIndexed();
    if (!isIndexed) {
      return this.ctx.indexWorkspace();
    }
  }

  private interactCommand(payload: ExecCommandPayload) {
    const observer = Observer.getInstance();
    const event = ('interact-command-' + payload.id) as `interact-command-${string}`;
    console.log(event);
    observer.emit(event, payload);
  }

  private async onDidReceiveMessage(message: MESSAGE) {
    console.log('VIEW PROVIDER MESSAGE', message);
    if (message.command === COMMANDS.changeConfig) {
      await Conf.updateConfig(message);
    }
    if (message.command === COMMANDS.removeChatSession) {
      await this.storage.removeSession(message.value as string);
    }

    if (message.command === COMMANDS.configListenerMounted) {
      await this.onStartMessages();
    }
    if (message.command === COMMANDS.showPreview) {
      showMemoryDiff(message.value as ShowPreviewMessage);
    }
    if (message.command === COMMANDS.indexing) {
      this.startIndexingWorkspace(true);
    }
    if (message.command === COMMANDS.selectContext) {
      this.selectContextFiles();
    }
    if (message.command === COMMANDS.interactCommand) {
      this.interactCommand(message.value as ExecCommandPayload);
    }

    const value = message.value as ChatMessage;

    if (message.command === COMMANDS.sendMessage) {
      await this.onReceiveUserMessage(value);
    }
  }

  public async selectContextFiles() {
    const payload = await this.contextSelector.openContextSelector();
    this.web.webview.postMessage({ type: COMMANDS.selectContext, payload });
  }

  public async useAgent(message: ChatMessage) {
    console.log('RECEIVED_MESSAGE BACKEND--------------', message);

    const [ctx, files] = await Promise.all([
      this.ctx.getContext(message.text, { contextLimit: 10 }),
      this.ctx.getFilesContent(message.files),
    ]);

    console.log('AGENT CONTEXT', ctx);
    // const history = this.storage.getSessionChatHistory(message.session);

    return this.cursor.exec({
      fileTree: ctx.fileTree,
      workspaceContext: ctx.workspaceContext,
      language: ctx.language,
      request: message.text,
      files,
    });

    // historyToUpdate.push(payload);

    // this.storage.addChatHistoryItems(historyToUpdate);
    // this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  }

  public updateContext(payload: unknown) {
    if (!this.web) return;

    this.web.webview.postMessage({ type: COMMANDS.changeConfig, payload });
  }
}
