import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';

type Theme = {
  fileExtensions: { [key: string]: string };
  fileNames: { [key: string]: string };
  iconDefinitions: { [key: string]: { iconPath?: string } };
};

export class Icons {
  private themePath: string = '';
  private iconsMap: { [key: string]: string } = {};
  extensionPath: string = '';
  private theme: Theme = { fileExtensions: {}, fileNames: {}, iconDefinitions: {} };

  async initIcons() {
    const iconTheme = vscode.workspace.getConfiguration('workbench').get<string>('iconTheme');
    if (!iconTheme) {
      return {};
    }
    const allExts = vscode.extensions.all;
    const themeExt = allExts.find((ext) => {
      const contributes = ext.packageJSON?.contributes;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return contributes?.iconThemes?.some((t: any) => t.id === iconTheme);
    });

    if (!themeExt) {
      return {};
    }

    this.extensionPath = themeExt.extensionPath;

    this.themePath = themeExt.extensionPath;
    const contributes = themeExt.packageJSON.contributes.iconThemes.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) => t.id === iconTheme,
    );
    const themeFile = path.join(this.themePath, contributes.path);
    this.theme = JSON.parse(await fs.readFile(themeFile, 'utf8'));
  }

  getIcons(webView: vscode.WebviewView) {
    const entries = Object.entries(this.theme.fileNames).concat(
      Object.entries(this.theme.fileExtensions),
    );

    return entries.reduce((acc, [key, value]) => {
      const icon = this.theme.iconDefinitions[value].iconPath;
      if (!icon) return acc;
      const iconPath = path.join(this.themePath, icon);
      const uri = webView.webview.asWebviewUri(vscode.Uri.file(iconPath)).toString();
      acc[key] = uri;
      return acc;
    }, this.iconsMap);
  }
}
