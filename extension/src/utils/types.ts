import * as vscode from 'vscode';
export * from '../../../global.types';
export type PromptMessages = { role: 'system' | 'user' | 'assistant'; content: string }[];

export const CHAT_HISTORY_PROP = 'chatHistory';
export type CHAT_HISTORY = {
  [key: string]: string[];
};

export type PromptProps = {
  workspaceContext: string;
  selection: string;
  text: string;
  currentFilePath?: string;
  history: string[];
  language?: string;
  fileTree?: string[];
};

export type FileChunk = {
  path: string;
  text: string;
  workspace: string;
  startLine?: number;
  endLine?: number;
};

export type DbFile = FileChunk & { id: string };

export type ContextT = {
  editor: vscode.TextEditor | undefined;
  workspaceContext: string;
  selection: string;
  currentFilePath: string;
  language?: string;
  fileTree: string[];
};

export type ContextData = ContextT & {
  userPrompt: string;
};

type ObserverArgsMap = {
  readFile: { file: string };
  editFile: { file: string; content: string };
  deleteFile: { file: string };
  renameFile: { old: string; newName: string };
  runCommand: { command: string };
};
export type GlobalObserverEvent<T extends keyof ObserverArgsMap> = {
  status: 'pending' | 'error' | 'done';
  id: string;
  error?: string;
  args: ObserverArgsMap[T];
};
