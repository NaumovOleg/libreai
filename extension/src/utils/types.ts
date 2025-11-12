import * as vscode from 'vscode';

export * from '../../../global.types';
export type PromptMessages = { role: 'system' | 'user' | 'assistant'; content: string }[];

export const CHAT_HISTORY_PROP = 'chatHistory';
export const WORKSPACE_INDEX_PREFIX = 'workspace_index_';
export type CHAT_HISTORY = string[];

export type PromptProps = {
  selection: string;
  text: string;
  currentFilePath?: string;
  history?: string[];
  language?: string;
  fileTree?: string[];
  files?: { file: string; content: string }[];
};

export type Ctx = {
  editor: vscode.TextEditor | undefined;
  selection: string;
  currentFilePath: string;
  language?: string;
  fileTree: string[];
};

export type FileChunk = {
  path: string;
  text: string;
  workspace: string;
  startLine: number;
  endLine: number;
};

export type DbFile = FileChunk & { id: string };

export type ContextT = {
  editor: vscode.TextEditor | undefined;
  workspaceContext?: string;
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
