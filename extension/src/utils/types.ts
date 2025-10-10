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
  files?: { file: string; content: string }[];
};

export type FileChunk = {
  path: string;
  text: string;
  workspace: string;
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

export type SuggestionPromptParams = {
  language?: string;
  before: string;
  after: string;
};
