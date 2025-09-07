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
  agent = 'agent',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MESSAGE = { command: COMMANDS; key: CONFIG_PARAGRAPH; value: any };

export type ProviderName = 'openai' | 'ollama';

export interface AiConfigT {
  provider: 'openai' | 'ollama' | 'deepseek';
  model: string;
  endpoint: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
}

export type ChatMessage = {
  from: 'user' | 'ai';
  text: string;
  time?: Date;
  id: string;
};

export type ChatSession = { [key: string]: ChatMessage[] };

export type State = {
  chatSession: ChatSession;
  lastSession?: string;
};

export enum FILE_ACTIONS {
  createFile = 'createFile',
  updateFile = 'updateFile',
  deleteFile = 'deleteFile',
  renameFile = 'renameFile',
}
