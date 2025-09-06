import { AiConfigT, ChatMessage, CONFIG_PARAGRAPH } from './types';

export type ConfigContextType = {
  [CONFIG_PARAGRAPH.chatConfig]: AiConfigT;
  [CONFIG_PARAGRAPH.autoCompleteConfig]: AiConfigT;
  setConfig: (type: CONFIG_PARAGRAPH, conf: Partial<AiConfigT>) => void;
  applyChanges: (type: CONFIG_PARAGRAPH) => void;
};

export type ChatContextType = {
  sessions: string[];
  messages: ChatMessage[];
  sendMessage: (message: ChatMessage) => void;
  setSession: (session: string) => void;
  removeSession: (session: string) => void;
  addSession: () => void;
  session: string;
};
