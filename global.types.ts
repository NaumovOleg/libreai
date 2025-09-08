export enum CONFIG_PARAGRAPH {
  'chatConfig' = 'chatConfig',
  'autoCompleteConfig' = 'autoCompleteConfig',
}

export enum COMMANDS {
  changeConfig = 'changeConfig',
  configListenerMounted = 'configListenerMounted',
  sendMessage = 'sendMessage',
  chatStream = 'chatStream',
  chatStreamEnd = 'chatStreamEnd',
  updatedContext = 'updatedContext',
  removeChatSession = 'removeChatSession',
  agentResponse = 'agentResponse',
}

export type MESSAGE = {
  command: COMMANDS;
  key?: CONFIG_PARAGRAPH;
  value?: AiConfigT | ChatMessage | string;
};

export type ProviderName = 'openai' | 'ollama';

export interface AiConfigT {
  provider: 'openai' | 'ollama' | 'deepseek';
  model: string;
  endpoint: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
}

export enum Providers {
  user = 'user',
  ai = 'ai',
  agent = 'agent',
}

export type ChatSession = { [key: string]: ChatMessage[] };

export type State = {
  chatSession: ChatSession;
  lastSession?: string;
};

export type AgentInstruction = {
  action: FILE_ACTIONS;
  file: string;
  content: string;
  newName: string;
  hasNext: true | false;
};

export type ChatMessage = {
  from: Providers;
  to: Providers;
  text: string;
  time?: Date;
  id: string;
  session: string;
  type?: 'message' | 'instruction';
  instruction?: AgentInstruction;
};

export enum FILE_ACTIONS {
  createFile = 'createFile',
  updateFile = 'updateFile',
  deleteFile = 'deleteFile',
  renameFile = 'renameFile',
}
