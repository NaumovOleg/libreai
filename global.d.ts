declare enum CONFIG_PARAGRAPH {
  'chatConfig' = 'chatConfig',
}

declare enum COMMANDS {
  'changeConfig' = 'changeConfig',
}

declare type MESSAGE = { command: COMMANDS; key: CONFIG_PARAGRAPH; value: unknown };

declare const acquireVsCodeApi: () => {
  postMessage: (message: MESSAGE) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
};
