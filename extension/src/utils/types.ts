export * from '../../../global.types';

export type PromptMessages = { role: 'system' | 'user' | 'assistant'; content: string }[];

export const CHAT_HISTORY_PROP = 'chatHistory';
export type CHAT_HISTORY = {
  [key: string]: string[];
};
