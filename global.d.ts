declare enum CONFIG_PARAGRAPH {
  'chatConfig' = 'chatConfig',
  'autoCompleteConfig' = 'autoCompleteConfig',
}

declare enum COMMANDS {
  'changeConfig' = 'changeConfig',
  'configListenerMounted' = 'configListenerMounted',
}

declare type MESSAGE = { command: COMMANDS; key?: CONFIG_PARAGRAPH; value?: unknown };

type ChatMessage = {
  from: 'user' | 'ai';
  text: string;
  time?: Date;
};

type ChatSession = { [key: string]: ChatMessage[] };

type State = {
  chatSession: ChatSession;
};

declare const acquireVsCodeApi: () => {
  postMessage: (message: MESSAGE) => void;
  getState: () => State;
  setState: (state: State) => void;
};
