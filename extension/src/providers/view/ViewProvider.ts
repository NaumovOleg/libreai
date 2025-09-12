import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

import { AIAgent } from '../../agents';
import { AIClient, SessionStorage } from '../../clients';
import { Context } from '../../services';
import {
  CHAT_PROMPT,
  ChatMessage,
  COMMANDS,
  Conf,
  CONFIG_PARAGRAPH,
  MESSAGE,
  Providers,
  USER_ACTIONS_ON_MESSAGE,
  uuid,
} from '../../utils';
import { Icons } from '../Icons';

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'libreChatView';
  private mediaFolder = 'out/view';
  private vebView!: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private aiClient: AIClient,
    private agent: AIAgent,
    private storage: SessionStorage,
    private ctx: Context,
    private icons: Icons,
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this.vebView = webviewView;
    this.vebView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this.extensionUri.fsPath, 'out', 'view')),
        vscode.Uri.file(path.join(this.icons.extensionPath, 'icons')),
      ],
    };

    this.vebView.webview.onDidReceiveMessage(
      (message) => this.onDidReceiveMessage(message),
      undefined,
      [],
    );

    const htmlPath = path.join(this.extensionUri.fsPath, 'out', 'view', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');

    const iconsMap = this.icons.getIcons(this.vebView);
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

    this.vebView.webview.html = html;
  }

  private onStartMessages() {
    return this.vebView.webview.postMessage({
      type: COMMANDS.changeConfig,
      payload: {
        [CONFIG_PARAGRAPH.chatConfig]: Conf.chatConfig,
        [CONFIG_PARAGRAPH.autoCompleteConfig]: Conf.autoCompleteConfig,
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
      console.log('CONTEXT++++++++++++++++++++++++', ctx);
      const history = this.storage.getSessionChatHistory(message.session);
      const messages = CHAT_PROMPT({ ...ctx, userPrompt: message.text, history });
      for await (const chunk of this.aiClient.chat(messages)) {
        payload.text += chunk;
        this.vebView.webview.postMessage({ type: COMMANDS.chatStream, payload });
      }

      this.vebView.webview.postMessage({ type: COMMANDS.chatStreamEnd });
      await this.storage.addChatHistoryItems([message, payload]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
    }
  }

  private async onDidReceiveMessage(message: MESSAGE) {
    if (message.command === COMMANDS.changeConfig) {
      await Conf.updateConfig(message);
    }
    if (message.command === COMMANDS.removeChatSession) {
      await this.storage.removeSession(message.value as string);
    }

    if (message.command === COMMANDS.configListenerMounted) {
      await this.onStartMessages();
    }

    const value = message.value as ChatMessage;

    if (message.command === COMMANDS.sendMessage) {
      await this.onReceiveUserMessage(value);
    }
  }

  public async useAgent(message: ChatMessage) {
    console.log('RECEIVED_MESSAGE BACKEND--------------', message);

    const historyToUpdate: ChatMessage[] = [{ ...message, instructions: undefined }];
    if (message.text === USER_ACTIONS_ON_MESSAGE.runInstructions && message.instructions?.length) {
      const instructions = await this.agent.processInstruction(message.instructions);
      return this.storage.addChatHistoryItems([
        {
          ...message,
          from: Providers.agent,
          text: '<instruction>',
          instructions,
        },
      ]);
    }

    const context = await this.ctx.getContext(message.text);
    const history = this.storage.getSessionChatHistory(message.session);

    console.log('HISTORY--------------', history);
    console.log('CONTEXT--------------', context);

    const data = { ...context, userPrompt: message.text, history };
    const instructions = await this.agent.run(data);

    const payload: ChatMessage = {
      from: Providers.agent,
      to: Providers.user,
      text: '<instruction>',
      time: new Date(),
      id: uuid(),
      session: message.session,
      type: 'instruction',
      instructions: instructions?.map((el) => {
        el.id = uuid(5);
        return el;
      }),
    };

    historyToUpdate.push(payload);

    this.storage.addChatHistoryItems(historyToUpdate);
    this.vebView.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  }

  public updateContext(payload: unknown) {
    if (!this.vebView) return;

    this.vebView.webview.postMessage({ type: COMMANDS.changeConfig, payload });
  }
}
