import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

export class ChatProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'libreChatView';
  private mediaFolder = 'out/chat';

  constructor(private readonly extensionUri: vscode.Uri) {}

  // resolveWebviewView(
  //   webviewView: vscode.WebviewView,
  //   _context: vscode.WebviewViewResolveContext,
  //   _token: vscode.CancellationToken,
  // ) {
  //   webviewView.webview.options = {
  //     enableScripts: true,
  //     localResourceRoots: [this.extensionUri],
  //   };

  //   const htmlPath = vscode.Uri.file(
  //     path.join(this.extensionUri.fsPath, 'chat/dist', 'index.html'),
  //   );

  //   console.log('++++++++++++++++++++++++', htmlPath);
  //   let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf-8');

  //   htmlContent = htmlContent
  //     // .replace(/src="(.+?)"/g, (_, src) => {
  //     //   const resourcePath = vscode.Uri.file(
  //     //     path.join(this.extensionUri.fsPath, 'media/views/chat', src),
  //     //   );
  //     //   return `src="${webviewView.webview.asWebviewUri(resourcePath)}"`;
  //     // })
  //     .replace(
  //       /href="chat\.css"/,
  //       `href="${webviewView.webview.asWebviewUri(
  //         vscode.Uri.file(path.join(this.extensionUri.fsPath, this.mediaFolder, 'chat.css')),
  //       )}"`,
  //     )
  //     .replace(
  //       /src="chat\.js"/,
  //       `src="${webviewView.webview.asWebviewUri(
  //         vscode.Uri.file(path.join(this.extensionUri.fsPath, this.mediaFolder, 'chat.js')),
  //       )}"`,
  //     );

  //   webviewView.webview.html = htmlContent;
  // }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.extensionUri.fsPath, 'out', 'chat'))],
    };

    const htmlPath = path.join(this.extensionUri.fsPath, 'out', 'chat', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');

    // Исправляем пути для webview
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
  }
}
