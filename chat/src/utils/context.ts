import { AiConfigT, ChatMessage, CONFIG_PARAGRAPH, INSTRUCTION_STATE, Providers } from './types';

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
  isAgentThinking: boolean;
  provider: Providers;
  setProvider: (provider: Providers) => void;
  sendMessage: (message: Omit<ChatMessage, 'id' | 'session' | 'from' | 'time' | 'to'>) => void;
  setSession: (session: string) => void;
  removeSession: (session: string) => void;
  addSession: () => void;
  interactInstruction: (
    data: ChatMessage,
    state: INSTRUCTION_STATE.accepted | INSTRUCTION_STATE.declined,
  ) => void;
};
