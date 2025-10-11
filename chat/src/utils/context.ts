import {
  AgentMessage,
  AiConfigT,
  Author,
  ChatMessage,
  COMMANDS,
  CONFIG_PARAGRAPH,
  IndexingPayload,
} from './types';

export type ConfigContextType = {
  [CONFIG_PARAGRAPH.chatConfig]: AiConfigT;
  [CONFIG_PARAGRAPH.autoCompleteConfig]: AiConfigT;
  [CONFIG_PARAGRAPH.agentConfig]: AiConfigT;
  setConfig: (type: CONFIG_PARAGRAPH, conf: Partial<AiConfigT>) => void;
  applyChanges: (type: CONFIG_PARAGRAPH) => void;
};

export type IndexingContextType = {
  payload: IndexingPayload;
  startIndexing: () => void;
};

export type ListenerContextType = {
  command: COMMANDS;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

export type ChatContextType = {
  files: string[];
  messages: (ChatMessage | AgentMessage)[];
  tmpMessage?: ChatMessage;
  isStreaming: boolean;
  isAgentThinking: boolean;
  provider: Author;
  setProvider: (provider: Author) => void;
  sendMessage: (message: Omit<ChatMessage, 'id' | 'session' | 'from' | 'time' | 'to'>) => void;
  clearSession: () => void;
};
