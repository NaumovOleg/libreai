export enum CONFIG_PARAGRAPH {
  'chatConfig' = 'chatConfig',
}

export enum COMMANDS {
  'changeConfig' = 'changeConfig',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MESSAGE = { command: COMMANDS; key: CONFIG_PARAGRAPH; value: any };

export type ProviderName = 'openai' | 'ollama';

export interface ChatConfig {
  provider: 'openai' | 'ollama' | 'deepseek';
  model: string;
  endpoint: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
}
