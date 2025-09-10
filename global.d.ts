declare enum CONFIG_PARAGRAPH {
  'chatConfig' = 'chatConfig',
  'autoCompleteConfig' = 'autoCompleteConfig',
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

declare enum INSTRUCTION_STATE {
  pending = 'pending',
  declined = 'declined',
  accepted = 'accepted',
}

declare type AgentInstruction = {
  action: AGENT_ACTIONS;
  file: string;
  content: string;
  newName: string;
  hasNext: true | false;
  language?: string;
  executedResponse?: string;
  state: INSTRUCTION_STATE;
  id: string;
};

declare type ChatMessage = {
  from: Providers;
  to: Providers;
  text: string;
  time?: Date;
  id: string;
  session: string;
  type?: 'message' | 'instruction';
  instructions?: AgentInstruction[];
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
