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
}

interface AiConfigT {
  provider: 'openai' | 'ollama' | 'deepseek' | 'openrouter';
  model: string;
  endpoint: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
}

declare type MESSAGE = {
  command: COMMANDS;
  key?: CONFIG_PARAGRAPH;
  value?: AiConfigT | ChatMessage | string;
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

type ChatSession = { [key: string]: ChatMessage[] };

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
