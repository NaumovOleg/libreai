export enum CONFIG_PARAGRAPH {
  'chatConfig' = 'chatConfig',
  'autoCompleteConfig' = 'autoCompleteConfig',
  'agentConfig' = 'agentConfig',
}

export enum EDITOR_EVENTS {
  readFile = 'readFile',
  editFile = 'editFile',
  renameFile = 'renameFile',
  deleteFile = 'deleteFile',
  createFile = 'createFile',
  command = 'command',
  planning = 'planning',
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

export type ChatSession = { [key: string]: (ChatMessage | AgentMessage)[] };

export type State = {
  chatSession: ChatSession;
  lastSession?: string;
  provider?: Providers;
};

export type ChatMessage = {
  from: Providers;
  to: Providers;
  text: string;
  time?: Date;
  id: string;
  session: string;
};

export type AgentMessage = {
  id: string;
  status: 'done' | 'pending' | 'error';
  type: 'planning' | 'editing';
  args: any;
  error?: string;
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

export type EditorObserverEventArgs = {
  [EDITOR_EVENTS.readFile]: { file: string; content: string };
  [EDITOR_EVENTS.renameFile]: { file: string; newName: string };
  [EDITOR_EVENTS.editFile]: { file: string; content: string; error?: string };
  [EDITOR_EVENTS.deleteFile]: string;
  [EDITOR_EVENTS.createFile]: string;
  [EDITOR_EVENTS.command]: string;
  [EDITOR_EVENTS.planning]: string;
};

export type ObserverStatus = 'pending' | 'done' | 'error';

export type ObserverPayloads<E extends keyof EditorObserverEventArgs> = {
  type?: E;
  status: ObserverStatus;
  error?: string;
  id: string;
  args?: EditorObserverEventArgs[E];
};

export type EditorObserverHandler<E extends keyof EditorObserverEventArgs> = (
  payload: ObserverPayloads<E>,
) => void;

export type EditorObserverHandlers =
  | EditorObserverHandler<EDITOR_EVENTS.readFile>
  | EditorObserverHandler<EDITOR_EVENTS.renameFile>
  | EditorObserverHandler<EDITOR_EVENTS.createFile>
  | EditorObserverHandler<EDITOR_EVENTS.editFile>
  | EditorObserverHandler<EDITOR_EVENTS.command>
  | EditorObserverHandler<EDITOR_EVENTS.deleteFile>;

export type EditorObserverListener<E extends EDITOR_EVENTS> = EditorObserverHandler<E>;
