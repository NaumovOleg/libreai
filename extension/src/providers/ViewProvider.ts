import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

import { COMMANDS, Conf, CONFIG_PARAGRAPH, MESSAGE } from '../utils';

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'libreChatView';
  private mediaFolder = 'out/view';
  private vebView: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

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

  private async onDidReceiveMessage(message: MESSAGE) {
    if (message.command === COMMANDS.changeConfig) {
      await Conf.updateConfig(message);
    }

    if (message.command === COMMANDS.configListenerMounted) {
      await this.onStartMessages();
    }
  }
}
