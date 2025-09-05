import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

import { Conf, CONFIG_PARAGRAPH, MESSAGE } from '../utils';

export class ChatProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'libreChatView';
  private mediaFolder = 'out/chat';

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.extensionUri.fsPath, 'out', 'chat'))],
    };

    webviewView.webview.onDidReceiveMessage(
      (message) => this.onDidReceiveMessage(message),
      undefined,
      [],
    );

    const htmlPath = path.join(this.extensionUri.fsPath, 'out', 'chat', 'index.html');
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

    webviewView.webview.html = html;

    webviewView.webview.postMessage({
      type: CONFIG_PARAGRAPH.chatConfig,
      payload: Conf.chatConfig,
    });
  }

  private async onDidReceiveMessage(message: MESSAGE) {
    await Conf.updateConfig(message);
  }

  resolveVebView() {
    console.log('qqqqqqqqqqqqqqqqqq');
  }
}
