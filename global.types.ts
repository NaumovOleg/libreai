export enum CONFIG_PARAGRAPH {
  'chatConfig' = 'chatConfig',
  'autoCompleteConfig' = 'autoCompleteConfig',
}

export enum EDITOR_EVENTS {
  readFile = 'readFile',
  editFile = 'editFile',
  renameFile = 'renameFile',
  deleteFile = 'deleteFile',
  createFile = 'createFile',
  command = 'command',
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
  editor = 'editor',
}

export type MESSAGE = {
  command: COMMANDS;
  key?: CONFIG_PARAGRAPH;
  value?: AiConfigT | ChatMessage | string;
};

export type ProviderName = 'openai' | 'ollama' | 'deepseek' | 'openrouter';

export interface AiConfigT {
  provider: 'openai' | 'ollama' | 'deepseek' | 'openrouter';
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
  provider?: Providers;
};

export enum INSTRUCTION_STATE {
  pending = 'pending',
  declined = 'declined',
  accepted = 'accepted',
}

export type AgentInstruction = {
  action: AGENT_ACTIONS;
  file: string;
  content: string;
  newName: string;
  language?: string;
  executedResponse?: string;
  state: INSTRUCTION_STATE;
  id: string;
  startLine?: number;
  endLine?: number;
  insertMode?: 'replace' | 'insertBefore' | 'insertAfter' | 'insert';
};

export type ChatMessage = {
  from: Providers;
  to: Providers;
  text: string;
  time?: Date;
  id: string;
  session: string;
  type?: 'message' | 'instruction';
  instructions?: AgentInstruction[];
};

export enum AGENT_ACTIONS {
  createFile = 'createFile',
  updateFile = 'updateFile',
  deleteFile = 'deleteFile',
  renameFile = 'renameFile',
  executeCommand = 'executeCommand',
}

export enum USER_ACTIONS_ON_MESSAGE {
  runInstructions = 'runInstructions',
}
