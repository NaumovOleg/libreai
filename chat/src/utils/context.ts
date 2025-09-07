import { AiConfigT, ChatMessage, CONFIG_PARAGRAPH, Providers } from './types';

export type ConfigContextType = {
  [CONFIG_PARAGRAPH.chatConfig]: AiConfigT;
  [CONFIG_PARAGRAPH.autoCompleteConfig]: AiConfigT;
  setConfig: (type: CONFIG_PARAGRAPH, conf: Partial<AiConfigT>) => void;
  applyChanges: (type: CONFIG_PARAGRAPH) => void;
};

export type ChatContextType = {
  sessions: string[];
  messages: ChatMessage[];
  tmpMessage?: ChatMessage;
  session: string;
  isStreaming: boolean;
  provider: Providers;
  setProvider: (provider: Providers) => void;
  sendMessage: (message: Omit<ChatMessage, 'id' | 'session' | 'from' | 'time' | 'to'>) => void;
  setSession: (session: string) => void;
  removeSession: (session: string) => void;
  addSession: () => void;
};
