import * as path from 'path';
import * as vscode from 'vscode';

import { EXCLUDED_FOLDERS } from './constants';
import { FileChunk } from './types';

export const uuid = (length: number = 4): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
};

export const getWorkspaceName = () => {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return 'noname';
  }
  return folders[0].name;
};

export const stripCodeFences = (code: string) => {
  return code.replace(/^```[a-zA-Z0-9]*\s*/, '').replace(/```$/, '');
};

async function collectEntries(
  dirUri: vscode.Uri,
  rootPath: string,
  tree: string[],
): Promise<boolean> {
  const entries = await vscode.workspace.fs.readDirectory(dirUri);

  let hasFiles = false;

  for (const [name, type] of entries) {
    if (EXCLUDED_FOLDERS.includes(name)) continue;

    const entryUri = vscode.Uri.file(path.join(dirUri.fsPath, name));
    const relativePath = path.relative(rootPath, entryUri.fsPath);

    if (type === vscode.FileType.Directory) {
      const subDirHasFiles = await collectEntries(entryUri, rootPath, tree);
      if (!subDirHasFiles) {
        tree.push(relativePath + '/');
      }
      hasFiles = hasFiles || subDirHasFiles;
    } else {
      tree.push(relativePath);
      hasFiles = true;
    }
  }

  return hasFiles;
}

export async function getWorkspaceFileTree(): Promise<string[]> {
  const rootUri = vscode.workspace.workspaceFolders?.[0]?.uri;
  if (!rootUri) return [];

  const rootPath = rootUri.fsPath;
  const tree: string[] = [];

  await collectEntries(rootUri, rootPath, tree);

  return tree.sort();
}

export const replaceLast = (str: string, search: string, replacement: string) => {
  const index = str.lastIndexOf(search);
  if (index === -1) return str;
  return str.slice(0, index) + replacement + str.slice(index + search.length);
};

export const getFileContent = async (path: string) => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw new Error('No workspace folder open');
  }

  const fileUri = vscode.Uri.file(path);
  const fileData = await vscode.workspace.fs.readFile(fileUri);
  return Buffer.from(fileData).toString('utf-8');

  // const lines = content.split(/\r?\n/);

  // return lines.map((line, index) => `${index + 1}| ${line}`).join('\n');
};

export const resolveFilePath = (filePath: string, root: string) => {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
  return vscode.Uri.file(absolutePath);
};

export const ensureDirectory = async (fileUri: vscode.Uri) => {
  const dirUri = vscode.Uri.file(path.dirname(fileUri.fsPath));
  try {
    await vscode.workspace.fs.stat(dirUri);
  } catch {
    await vscode.workspace.fs.createDirectory(dirUri);
  }
};

export const getSelectionText = () => {
  const editor = vscode.window.activeTextEditor;
  return editor?.document.getText(editor.selection) ?? editor?.document.getText() ?? '';
};

export const formFileContent = (files?: { content: string; file: string }[]) => {
  return files
    ?.map(
      (f) => `
<file path=${f.file}>
${f.content.trim()}
</file>`,
    )
    .join('\n\n');
};

export const parseEmbeddings = (chunks: FileChunk[]) => {
  const ctx = chunks.reduce(
    (acc, chunk) => {
      if (!acc[chunk.path]) {
        acc[chunk.path] = `<FILE>${chunk.path}</FILE> \n
          <CHUNK>
          ${chunk.text}
          </CHUNK>`;
      } else {
        const replaceString = `\n ${chunk.text}</CHUNK>`;

        acc[chunk.path] = replaceLast(acc[chunk.path], '</CHUNK>', replaceString);
      }
      return acc;
    },
    {} as { [key: string]: string },
  );

  return Object.values(ctx).reduce((acc, val) => {
    acc += val + '\n';
    return acc;
  }, '');
};

/**
 * Securely parses a JSON input. If input is a JSON string, parses and returns the object.
 * If input is already an object, returns as is. If parsing fails, returns the original input.
 * This function is safe for both pure JSON and plain strings.
 * @param input - The input to parse (can be JSON string, object, or primitive)
 * @returns Parsed object, or original input if parsing fails or if input is not JSON
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeJsonParse<T = any>(input: any): T {
  if (typeof input === 'object' && input !== null) {
    return input;
  }
  if (typeof input === 'string') {
    try {
      return JSON.parse(input);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return input as T;
    }
  }
  return input;
}
