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
  agentResponse = 'agentResponse',
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
  indexing = 'indexing',
  selectContext = 'selectContext',
  interactCommand = 'interactCommand',
}

export type ShowPreviewMessage = {
  file: string;
  content: string;
  old: string;
};

export type MESSAGE = {
  command: COMMANDS;
  key?: CONFIG_PARAGRAPH;
  value?: AiConfigT | ChatMessage | ShowPreviewMessage | ExecCommandPayload | string;
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

export enum Author {
  user = 'user',
  chat = 'chat',
  agent = 'agent',
}

export type Session = (ChatMessage | AgentMessage)[];

export type State = {
  session: Session;
  provider?: Author;
  isAgentThinking: boolean;
  indexing: {
    status: 'done' | 'pending' | 'error';
    progress: number;
    indexed: number;
    currentFile?: string;
    error?: string;
    total: number;
  };
};

export type ChatMessage = {
  from: Author;
  to: Author;
  text: string;
  files?: string[];
  time?: Date;
  id: string;
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

export type ObserverEditorEventArgs = {
  readFile: { file: string };
  renameFile: { file: string; newName: string };
  editFile: { file: string; content?: string; old?: string };
  deleteFile: { file: string };
  createFile: { file: string; content: string };
  command: { command: string; state?: 'confirmed' | 'declined' };
  planning: string;
  agentResponse: { content?: string };
};

export type AgentMessagePayload<E extends keyof ObserverEditorEventArgs> = {
  type: E;
  status: 'pending' | 'done' | 'error';
  error?: string;
  id: string;
  args: ObserverEditorEventArgs[E];
};

export type AgentMessage =
  | AgentMessagePayload<'planning'>
  | AgentMessagePayload<'editFile'>
  | AgentMessagePayload<'deleteFile'>
  | AgentMessagePayload<'createFile'>
  | AgentMessagePayload<'renameFile'>
  | AgentMessagePayload<'command'>
  | AgentMessagePayload<'readFile'>
  | AgentMessagePayload<'agentResponse'>;

export type ObserverEditorHandler<E extends keyof ObserverEditorEventArgs> = (
  payload: AgentMessagePayload<E>,
) => void;

export type ObserverEditorHandlers =
  | ObserverEditorHandler<EDITOR_EVENTS.readFile>
  | ObserverEditorHandler<EDITOR_EVENTS.renameFile>
  | ObserverEditorHandler<EDITOR_EVENTS.createFile>
  | ObserverEditorHandler<EDITOR_EVENTS.editFile>
  | ObserverEditorHandler<EDITOR_EVENTS.command>
  | ObserverEditorHandler<EDITOR_EVENTS.deleteFile>;

export type IndexingPayload = {
  status: 'done' | 'pending' | 'error';
  progress: number;
  indexed: number;
  currentFile?: string;
  error?: string;
  total: number;
};

export type ExecCommandPayload = {
  id: string;
  state: 'confirmed' | 'declined';
};

export type IndexingMessage = {
  type: 'indexing';
  payload: IndexingPayload;
};

export type ExecCommandMessage = {
  type: 'execCommand';
  payload: ExecCommandPayload;
};

export type ObserverEvents = 'agentResponse' | 'indexing';
