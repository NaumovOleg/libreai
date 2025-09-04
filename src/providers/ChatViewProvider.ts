import path from 'path';
import * as vscode from 'vscode';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'aiInlineChatView';

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = { enableScripts: true };
    const htmlPath = path.join(this.extensionUri.path, 'media', 'chatView.html');
    const htmlUri = vscode.Uri.file(htmlPath);

    webviewView.webview.html = `<iframe src="${webviewView.webview.asWebviewUri(
      htmlUri,
    )}" style="width:100%; height:100%; border:none;"></iframe>`;
  }
}
