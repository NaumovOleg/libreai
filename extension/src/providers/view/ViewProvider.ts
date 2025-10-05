import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

import { Chat, Cursor } from '../../ai';
import { SessionStorage } from '../../clients';
import { Observer } from '../../observer';
import { callbacks, Context, showMemoryDiff } from '../../services';
import {
  ChatMessage,
  COMMANDS,
  Conf,
  CONFIG_PARAGRAPH,
  MESSAGE,
  Providers,
  ShowPreviewMessage,
  uuid,
} from '../../utils';
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

    // const id = uuid();

    // setTimeout(() => {
    //   observer.emit(EDITOR_EVENTS.command, {
    //     status: 'pending',
    //     args: { command: 'npm install new-package' },
    //     id,
    //   });
    // }, 1000);
    // setTimeout(() => {
    //   observer.emit(EDITOR_EVENTS.command, {
    //     status: 'done',
    //     args: { command: 'npm install new-package' },
    //     id,
    //   });
    // }, 4000);

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
    if (message.to == Providers.ai) {
      return this.useChat(message);
    }
    if (message.to == Providers.agent) {
      return this.useAgent(message);
    }
  }

  private async useChat(message: ChatMessage) {
    try {
      const payload = {
        from: Providers.ai,
        to: Providers.user,
        time: new Date(),
        text: '',
        id: uuid(7),
        session: message.session,
      };

      const ctx = await this.ctx.getContext(message.text);
      const history = this.storage.getSessionChatHistory(message.session);

      for await (const chunk of this.chat.chatStream({ ...ctx, text: message.text, history })) {
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

  private async onDidReceiveMessage(message: MESSAGE) {
    console.log(message);
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

    const value = message.value as ChatMessage;

    if (message.command === COMMANDS.sendMessage) {
      await this.onReceiveUserMessage(value);
    }
  }

  public async useAgent(message: ChatMessage) {
    console.log('RECEIVED_MESSAGE BACKEND--------------', message);

    const context = await this.ctx.getContext(message.text);
    // const history = this.storage.getSessionChatHistory(message.session);

    const instructions = await this.cursor.exec({
      fileTree: context.fileTree,
      workspaceContext: context.workspaceContext,
      language: context.language,
      request: message.text,
    });

    console.log('AGENT_RUN-----------', instructions);

    // historyToUpdate.push(payload);

    // this.storage.addChatHistoryItems(historyToUpdate);
    // this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  }

  public updateContext(payload: unknown) {
    if (!this.web) return;

    this.web.webview.postMessage({ type: COMMANDS.changeConfig, payload });
  }
}
