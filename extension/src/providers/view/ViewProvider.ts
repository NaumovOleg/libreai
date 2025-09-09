import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

import { AIAgent } from '../../agents';
import { AIClient, SessionStorage } from '../../clients';
import {
  CHAT_PROMPT,
  ChatMessage,
  COMMANDS,
  Conf,
  CONFIG_PARAGRAPH,
  getContext,
  MESSAGE,
  Providers,
  uuid,
} from '../../utils';

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'libreChatView';
  private mediaFolder = 'out/view';
  private vebView: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private aiClient: AIClient,
    private agent: AIAgent,
    private storage: SessionStorage,
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this.vebView = webviewView;
    this.vebView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.extensionUri.fsPath, 'out', 'view'))],
    };

    this.vebView.webview.onDidReceiveMessage(
      (message) => this.onDidReceiveMessage(message),
      undefined,
      [],
    );

    const htmlPath = path.join(this.extensionUri.fsPath, 'out', 'view', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');

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
      const ctx = await getContext();
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
    console.log('RECEIVED_MESSAGE--------------', message);
    const context = await getContext();
    const history = this.storage.getSessionChatHistory(message.session);

    const data = { ...context, userPrompt: message.text, history };
    const historyToUpdate: ChatMessage[] = [{ ...message, instruction: undefined }];
    if (message.instruction && message.text === 'next') {
      await this.agent.processInstruction(message.instruction);
    }
    const instruction = await this.agent.run(data);

    const payload: ChatMessage = {
      from: Providers.agent,
      to: Providers.user,
      text: '<instruction>',
      time: new Date(),
      id: uuid(),
      session: message.session,
      type: 'instruction',
      instruction,
    };

    historyToUpdate.push(payload);

    console.log('HITORYOOOOOOOOOOOOOOOOOO', instruction, payload);

    this.storage.addChatHistoryItems(historyToUpdate);
    this.vebView.webview.postMessage({ type: COMMANDS.agentResponse, payload });

    console.log(
      'BACKEND HISTORY========================',
      this.storage.getSessionChatHistory(message.session),
    );
  }

  public updateContext(payload: unknown) {
    if (!this.vebView) return;

    this.vebView.webview.postMessage({ type: COMMANDS.changeConfig, payload });
  }
}
