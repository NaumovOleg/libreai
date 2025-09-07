import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

import { AIAgent } from '../agents';
import { AIClient } from '../clients';
import { CHAT_PROMPT, ChatMessage, COMMANDS, Conf, CONFIG_PARAGRAPH, MESSAGE } from '../utils';

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'libreChatView';
  private mediaFolder = 'out/view';
  private vebView: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private aiClient: AIClient,
    private agent: AIAgent,
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

  private async onReceivedUserChatMessage(message: ChatMessage) {
    try {
      for await (const chunk of this.aiClient.chat(CHAT_PROMPT(message.text))) {
        this.vebView.webview.postMessage({
          type: COMMANDS.chatStream,
          payload: chunk,
        });
      }

      this.vebView.webview.postMessage({ type: COMMANDS.chatStreamEnd });
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

    if (message.command === COMMANDS.configListenerMounted) {
      await this.onStartMessages();
    }

    if (message.command === COMMANDS.sendMessage) {
      await this.useAgent(message.value);
      // await this.onReceivedUserChatMessage(message.value);
    }
    if (message.command === COMMANDS.agent) {
      await this.useAgent(message.value);
    }
  }

  public async useAgent(prompt: string) {
    await this.agent.run(prompt);
  }

  public updateContext(payload: unknown) {
    if (!this.vebView) return;

    this.vebView.webview.postMessage({
      type: COMMANDS.changeConfig,
      payload,
    });
  }
}
