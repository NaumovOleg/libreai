import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

export class ChatProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'libreChatView';
  private mediaFolder = 'media/views/chat';

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    const htmlPath = vscode.Uri.file(
      path.join(this.extensionUri.fsPath, this.mediaFolder, 'chat.html'),
    );

    console.log('++++++++++++++++++++++++', htmlPath);
    let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf-8');

    htmlContent = htmlContent
      // .replace(/src="(.+?)"/g, (_, src) => {
      //   const resourcePath = vscode.Uri.file(
      //     path.join(this.extensionUri.fsPath, 'media/views/chat', src),
      //   );
      //   return `src="${webviewView.webview.asWebviewUri(resourcePath)}"`;
      // })
      .replace(
        /href="chat\.css"/,
        `href="${webviewView.webview.asWebviewUri(
          vscode.Uri.file(path.join(this.extensionUri.fsPath, this.mediaFolder, 'chat.css')),
        )}"`,
      )
      .replace(
        /src="chat\.js"/,
        `src="${webviewView.webview.asWebviewUri(
          vscode.Uri.file(path.join(this.extensionUri.fsPath, this.mediaFolder, 'chat.js')),
        )}"`,
      );

    webviewView.webview.html = htmlContent;
  }
}
