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
  helperMessage = 'helperMessage',
  onChangeWorkspace = 'onChangeWorkspace',
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
  autocompleteDeleay?: number;
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

declare type FilePath = {
  absolute: string;
  relative: string;
};

declare type ChatMessage = {
  from: Author;
  to: Author;
  text: string;
  time?: Date;
  id: string;
  files?: FilePath[];
};

declare type ObserverEditorEventArgs = {
  readFile: { file: string };
  renameFile: { file: string; newName: string };
  editFile: { file: string; content?: string; old?: string };
  deleteFile: { file: string };
  createFile: { file: string; content: string };
  command: { command: string };
  planning: string;
  analizing: string;
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
  | AgentMessagePayload<'analizing'>
  | AgentMessagePayload<'agentResponse'>;

type Session = (ChatMessage | AgentMessage)[];

type State = {
  session: Session;
  provider?: Author;
  isAgentThinking: boolean;
  indexing: {
    [key: string]: {
      status: 'done' | 'pending' | 'error' | 'not-indexed';
      progress: number;
      indexed: number;
      currentFile?: string;
      error?: string;
      total: number;
      workspace: string;
    };
  };
};

declare const acquireVsCodeApi: () => {
  postMessage: (message: MESSAGE) => void;
  getState: () => State;
  setState: (state: State) => void;
};

declare module '*.scss';
