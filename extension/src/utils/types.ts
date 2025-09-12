export * from '../../../global.types';

export type PromptMessages = { role: 'system' | 'user' | 'assistant'; content: string }[];

export const CHAT_HISTORY_PROP = 'chatHistory';
export type CHAT_HISTORY = {
  [key: string]: string[];
};

export type PromptProps = {
  workspaceContext: string;
  selection: string;
  userPrompt: string;
  currentFilePath?: string;
  history: string[];
  language?: string;
  fileTree?: string;
};

export type FileChunk = {
  path: string;
  text: string;
  workspace: string;
};

export type DbFile = FileChunk & { id: string };
