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
  showPreview = 'showPreview',
}

export type ShowPreviewMessage = {
  file: string;
  content: string;
  old: string;
};

export type MESSAGE = {
  command: COMMANDS;
  key?: CONFIG_PARAGRAPH;
  value?: AiConfigT | ChatMessage | ShowPreviewMessage | string;
};

export enum AiProviders {
  openai = 'openai',
  ollama = 'ollama',
  deepseek = 'deepseek',
  openrouter = 'openrouter',
}

export interface AiConfigT {
  provider: AiProviders;
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

export enum AGENT_ACTIONS {
  createFile = 'createFile',
  updateFile = 'updateFile',
  deleteFile = 'deleteFile',
  renameFile = 'renameFile',
  readFile = 'readFile',
  executeCommand = 'executeCommand',
}

export enum USER_ACTIONS_ON_MESSAGE {
  runInstructions = 'runInstructions',
}

export type EditorObserverEventArgs = {
  readFile: { file: string };
  renameFile: { file: string; newName: string };
  editFile: { file: string; content?: string; old?: string };
  deleteFile: { file: string };
  createFile: { file: string; content: string };
  command: { command: string };
  planning: string;
};

export enum ObserverStatus {
  pending = 'pending',
  done = 'done',
  error = 'error',
}

export type AgentMessagePayload<E extends keyof EditorObserverEventArgs> = {
  type: E;
  status: ObserverStatus;
  error?: string;
  id: string;
  args: EditorObserverEventArgs[E];
};

export type AgentMessage =
  | AgentMessagePayload<'planning'>
  | AgentMessagePayload<'editFile'>
  | AgentMessagePayload<'deleteFile'>
  | AgentMessagePayload<'createFile'>
  | AgentMessagePayload<'renameFile'>
  | AgentMessagePayload<'command'>
  | AgentMessagePayload<'readFile'>;

export type EditorObserverHandler<E extends keyof EditorObserverEventArgs> = (
  payload: AgentMessagePayload<E>,
) => void;

export type EditorObserverHandlers =
  | EditorObserverHandler<EDITOR_EVENTS.readFile>
  | EditorObserverHandler<EDITOR_EVENTS.renameFile>
  | EditorObserverHandler<EDITOR_EVENTS.createFile>
  | EditorObserverHandler<EDITOR_EVENTS.editFile>
  | EditorObserverHandler<EDITOR_EVENTS.command>
  | EditorObserverHandler<EDITOR_EVENTS.deleteFile>;

export type EditorObserverListener<E extends EDITOR_EVENTS> = EditorObserverHandler<E>;
