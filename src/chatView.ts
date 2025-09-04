import * as path from 'path';
import * as vscode from 'vscode';

import { AIClient } from './aiClient';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'aiInlineChat.view';
  private _view?: vscode.WebviewView;
  private messages: { role: 'user' | 'assistant'; content: string }[] = [];

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly aiClient: AIClient,
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'chat') {
        await this.handleUserMessage(msg.text);
      } else if (msg.type === 'clear') {
        this.clearMessages();
      }
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = getNonce();
    const htmlPath = path.join(this.extensionUri.fsPath, 'media', 'chatView.html');
    const htmlUri = vscode.Uri.file(htmlPath);
    const styleUri = webview.asWebviewUri(htmlUri);

    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy"
          content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Chat</title>
        <link rel="stylesheet" href="${styleUri}">
      </head>
      <body>
        <div id="chat"></div>
        <div id="input-container">
          <textarea id="input" placeholder="Введите сообщение..."></textarea>
          <button id="send">Отправить</button>
          <button id="clear">Очистить</button>
        </div>
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          const chat = document.getElementById("chat");
          const input = document.getElementById("input");
          const sendBtn = document.getElementById("send");
          const clearBtn = document.getElementById("clear");

          sendBtn.addEventListener("click", () => {
            const text = input.value.trim();
            if (!text) return;
            vscode.postMessage({ type: "chat", text });
            appendMessage("user", text);
            input.value = "";
          });

          clearBtn.addEventListener("click", () => {
            vscode.postMessage({ type: "clear" });
            chat.innerHTML = "";
          });

          window.addEventListener("message", (event) => {
            const msg = event.data;
            if (msg.type === "addMessage") {
              appendMessage(msg.role, msg.text);
            }
          });

          function appendMessage(role, text) {
            const div = document.createElement("div");
            div.className = role;
            div.textContent = (role === "user" ? "👤 " : "🤖 ") + text;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
          }
        </script>
      </body>
      </html>
    `;
  }

  private async handleUserMessage(text: string) {
    this.messages.push({ role: 'user', content: text });
    if (!this._view) return;

    const assistantMsg = { role: 'assistant' as const, content: '' };
    this.messages.push(assistantMsg);
    this._view.webview.postMessage({
      type: 'addMessage',
      role: 'assistant',
      text: '',
    });

    try {
      for await (const chunk of this.aiClient.streamChat(this.messages)) {
        assistantMsg.content += chunk;
        this._view.webview.postMessage({
          type: 'addMessage',
          role: 'assistant',
          text: assistantMsg.content,
        });
      }
    } catch (err: any) {
      vscode.window.showErrorMessage('AI Error: ' + err.message);
    }
  }

  clearMessages() {
    this.messages = [];
    if (this._view) {
      this._view.webview.postMessage({ type: 'clearAll' });
    }
  }

  postUserMessage(text: string) {
    this._view?.webview.postMessage({ type: 'addMessage', role: 'user', text });
    this.handleUserMessage(text);
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
