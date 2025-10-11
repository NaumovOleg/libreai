declare enum CONFIG_PARAGRAPH {
  'chatConfig' = 'chatConfig',
  'autoCompleteConfig' = 'autoCompleteConfig',
  'agentConfig' = 'agentConfig',
}

declare enum COMMANDS {
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

declare type ShowPreviewMessage = {
  file: string;
  content: string;
  old: string;
};

declare enum AiProviders {
  openai = 'openai',
  ollama = 'ollama',
  deepseek = 'deepseek',
  openrouter = 'openrouter',
}

interface AiConfigT {
  provider: AiProviders;
  model: string;
  endpoint: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
}
declare type ExecCommandPayload = {
  id: string;
  state: 'confirmed' | 'declined';
};

declare type MESSAGE = {
  command: COMMANDS;
  key?: CONFIG_PARAGRAPH;
  value?: AiConfigT | ChatMessage | ShowPreviewMessage | ExecCommandPayload | string;
};

declare enum Author {
  user = 'user',
  chat = 'chat',
  agent = 'agent',
}

declare enum AGENT_ACTIONS {
  createFile = 'createFile',
  updateFile = 'updateFile',
  deleteFile = 'deleteFile',
  renameFile = 'renameFile',
  executeCommand = 'executeCommand',
}

declare type ChatMessage = {
  from: Author;
  to: Author;
  text: string;
  time?: Date;
  id: string;
  session: string;
  files?: string[];
};

declare type ObserverEditorEventArgs = {
  readFile: { file: string };
  renameFile: { file: string; newName: string };
  editFile: { file: string; content?: string; old?: string };
  deleteFile: { file: string };
  createFile: { file: string; content: string };
  command: { command: string };
  planning: string;
  agentResponse: { content?: string };
};

declare type AgentMessagePayload<E extends keyof ObserverEditorEventArgs> = {
  type: E;
  status: 'pending' | 'done' | 'error';
  error?: string;
  id: string;
  args: ObserverEditorEventArgs[E];
};

declare type AgentMessage =
  | AgentMessagePayload<'planning'>
  | AgentMessagePayload<'editFile'>
  | AgentMessagePayload<'deleteFile'>
  | AgentMessagePayload<'createFile'>
  | AgentMessagePayload<'renameFile'>
  | AgentMessagePayload<'command'>
  | AgentMessagePayload<'readFile'>
  | AgentMessagePayload<'agentResponse'>;

type ChatSession = { [key: string]: (ChatMessage | AgentMessage)[] };

type State = {
  chatSession: ChatSession;
  lastSession?: string;
  provider?: Author;
  indexing: {
    status: 'done' | 'pending' | 'error';
    progress: number;
    indexed: number;
    currentFile?: string;
    error?: string;
    total: number;
  };
};

declare const acquireVsCodeApi: () => {
  postMessage: (message: MESSAGE) => void;
  getState: () => State;
  setState: (state: State) => void;
};
