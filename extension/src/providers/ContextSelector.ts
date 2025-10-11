import { filePattern, foldersPattern } from '@utils';
import { readFileSync } from 'fs';
import * as vscode from 'vscode';

export class ContextSelector {
  async openContextSelector() {
    const files = await vscode.workspace.findFiles(filePattern, foldersPattern);

    const items: vscode.QuickPickItem[] = files.map((uri) => ({
      label: vscode.workspace.asRelativePath(uri),
      description: uri.fsPath,
    }));

    const quickPick = vscode.window.createQuickPick();
    quickPick.items = items;
    quickPick.title = 'Add context';
    quickPick.placeholder = 'Select files which You  want to include to chat';
    quickPick.canSelectMany = true;
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;

    quickPick.show();

    return new Promise<vscode.Uri[]>((resolve) => {
      quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems.map((item) =>
          vscode.Uri.file(item.description ?? item.label),
        );
        quickPick.hide();
        resolve(selected);
      });

      quickPick.onDidHide(() => resolve([]));
    });
  }

  get subscription() {
    return vscode.commands.registerCommand('robocode.addContextFiles', async () => {
      const selected = await this.openContextSelector();

      if (selected.length) {
        const files = await Promise.all(
          selected.map(async (uri) => ({
            path: vscode.workspace.asRelativePath(uri),
            content: readFileSync(uri.fsPath, 'utf8'),
          })),
        );

        vscode.window.showInformationMessage(`Добавлено файлов: ${files.length}`);
      } else {
        vscode.window.showInformationMessage('Файлы не выбраны.');
      }
    });
  }
}
