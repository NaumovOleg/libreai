/* eslint-disable max-len */
import {
  RecursiveCharacterTextSplitter,
  SupportedTextSplitterLanguage,
} from '@langchain/textsplitters';
import * as path from 'path';
import * as vscode from 'vscode';

import { EXCLUDED_FOLDERS, EXTENSION_TO_LANGUAGE } from './constants';
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

export const getFileWorkspaceName = (uri: vscode.Uri) => {
  const folder = vscode.workspace.getWorkspaceFolder(uri);
  return folder?.name ?? 'noname';
};
export const getFileWorkspaceUrl = (uri: vscode.Uri) => {
  const folder = vscode.workspace.getWorkspaceFolder(uri);
  return folder?.uri?.fsPath ?? '';
};

export const getWorkspacesUrl = () => {
  return vscode.workspace.workspaceFolders?.map((f) => f.uri.fsPath) ?? [];
};

export const getRelativeToWorkspaceFilePath = (uri: vscode.Uri) => {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

  if (workspaceFolder) {
    return path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
  }

  return uri.fsPath;
};

export const getActiveWorkspaceName = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return undefined;

  const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
  return folder?.name;
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
  const workcpacesCount = vscode.workspace.workspaceFolders?.length ?? 1;

  let hasFiles = false;

  for (const [name, type] of entries) {
    if (EXCLUDED_FOLDERS.includes(name)) continue;

    const entryUri = resolveFilePath(path.join(dirUri.fsPath, name));
    let relativePath = path.relative(rootPath, entryUri.fsPath);
    if (workcpacesCount > 1) {
      relativePath = vscode.workspace.getWorkspaceFolder(entryUri)?.name + '/' + relativePath;
    }

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

export const getWorkspaceFileTree = async (): Promise<string[]> => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders?.length) return [];

  const allPaths: string[] = [];

  for (const folder of workspaceFolders) {
    const root = folder.uri.fsPath;

    await collectEntries(folder.uri, folder.uri.path, allPaths);

    // const files = await vscode.workspace.findFiles(
    //   new vscode.RelativePattern(folder, '**/*'),
    //   foldersPattern,
    // );

    // const relativePaths = files.map((file) =>
    //   path.join(folder.name, path.relative(root, file.fsPath)),
    // );

    // allPaths.push(...relativePaths);
  }

  return allPaths.sort();
};

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

export function trimAfterLastSlash(filePath: string): string {
  const parentDir = path.dirname(filePath);

  return parentDir.endsWith(path.sep) ? parentDir : parentDir + path.sep;
}

export const resolveFilePath = (filePath: string) => {
  if (!vscode.workspace.workspaceFolders || !vscode.workspace.workspaceFolders.length)
    return vscode.Uri.file(filePath);

  const folders = vscode.workspace.workspaceFolders;
  const root =
    folders.length > 1 ? trimAfterLastSlash(folders[0].uri.fsPath) : folders[0].uri.fsPath;

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

function getWorkspaceNameFromUrl(workspaceUrl: string): string {
  const uri = vscode.Uri.parse(workspaceUrl);
  return path.basename(uri.fsPath);
}

export const parseEmbeddings = (
  chunks: Pick<FileChunk, 'endLine' | 'path' | 'startLine' | 'text' | 'workspace'>[],
): string => {
  const filesMap = chunks.reduce<Record<string, string>>((acc, chunk) => {
    const path = getWorkspaceNameFromUrl(chunk.workspace) + '/' + chunk.path;

    const fileHeader = `<FILE path="${path}">\n`;
    const fileFooter = `</FILE>\n`;
    const chunkBlock = `<CODE startLine="${chunk.startLine}" endLine="${chunk.endLine}">\n${chunk.text}\n</CODE>\n`;

    if (!acc[path]) {
      acc[path] = fileHeader + chunkBlock + fileFooter;
    } else {
      acc[path] = acc[path].replace(fileFooter, chunkBlock + fileFooter);
    }

    return acc;
  }, {});

  return Object.values(filesMap).join('\n').trim();
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

export const getActiveWorkspaces = () => {
  const editor = vscode.window.activeTextEditor;
  const document = editor?.document;

  const workspaces = document
    ? [vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath ?? 'noname']
    : vscode.workspace.workspaceFolders?.map((el) => el.uri.fsPath);

  return workspaces?.filter(Boolean) ?? [];
};

export const batchArray = <T>(arr: T[], size: number): T[][] => {
  const result = [] as T[][];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export const raceAbortSignal = async <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  signal?: AbortSignal,
): Promise<Awaited<ReturnType<T>>> => {
  if (!signal) return fn();

  const abortPromise = new Promise<never>((_, reject) => {
    signal.addEventListener('abort', () => reject(new Error('Agent workflow aborted')));
  });

  return Promise.race([fn(), abortPromise]) as Promise<Awaited<ReturnType<T>>>;
};

export function detectLanguageByExtension(filePath: string): SupportedTextSplitterLanguage {
  const ext = path.extname(filePath).toLowerCase();

  return (EXTENSION_TO_LANGUAGE[ext] as SupportedTextSplitterLanguage) ?? 'markdown';
}

export const chunkFile = async (doc: string, uri: vscode.Uri) => {
  const extension = detectLanguageByExtension(uri.fsPath);

  const splitter = RecursiveCharacterTextSplitter.fromLanguage(extension, {
    chunkSize: 300,
    chunkOverlap: 20,
  });
  const texts = await splitter.createDocuments([doc]);

  const chunks = texts.map((t) => {
    return {
      text: t.pageContent,
      startLine: t.metadata.loc.lines.from,
      endLine: t.metadata.loc.lines.to,
      path: getRelativeToWorkspaceFilePath(uri),
      id: uuid(12),
      workspace: getFileWorkspaceUrl(uri),
    };
  });

  return chunks;
};

console.log(RecursiveCharacterTextSplitter.fromLanguage('markdown'));
