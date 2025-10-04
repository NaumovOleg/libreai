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

declare type MESSAGE = {
  command: COMMANDS;
  key?: CONFIG_PARAGRAPH;
  value?: AiConfigT | ChatMessage | ShowPreviewMessage | string;
};

declare enum Providers {
  user = 'user',
  ai = 'ai',
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
  from: Providers;
  to: Providers;
  text: string;
  time?: Date;
  id: string;
  session: string;
};

declare type EditorObserverEventArgs = {
  readFile: { file: string };
  renameFile: { file: string; newName: string };
  editFile: { file: string; content?: string; old?: string };
  deleteFile: { file: string };
  createFile: { file: string; content: string };
  command: { command: string };
  planning: string;
};

declare enum ObserverStatus {
  pending = 'pending',
  done = 'done',
  error = 'error',
}

declare type AgentMessagePayload<E extends keyof EditorObserverEventArgs> = {
  type: E;
  status: ObserverStatus;
  error?: string;
  id: string;
  args: EditorObserverEventArgs[E];
};

declare type AgentMessage =
  | AgentMessagePayload<'planning'>
  | AgentMessagePayload<'editFile'>
  | AgentMessagePayload<'deleteFile'>
  | AgentMessagePayload<'createFile'>
  | AgentMessagePayload<'renameFile'>
  | AgentMessagePayload<'command'>
  | AgentMessagePayload<'readFile'>;

type ChatSession = { [key: string]: (ChatMessage | AgentMessage)[] };

type State = {
  chatSession: ChatSession;
  lastSession?: string;
  provider?: Providers;
};

declare const acquireVsCodeApi: () => {
  postMessage: (message: MESSAGE) => void;
  getState: () => State;
  setState: (state: State) => void;
};
