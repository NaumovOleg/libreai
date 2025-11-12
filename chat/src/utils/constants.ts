/* eslint-disable @typescript-eslint/no-explicit-any */
export const AI_PROVIDERS = {
  ollama: 'Ollama',
  openai: 'Open ai',
  deepseek: 'DeepSeek',
  openrouter: 'Open Router',
};

export const FILE_ICONS: { [key: string]: string } = window['ICONS_PATHS' as any] as any;
export const MAX_MESSAGES = 30;

export const OPEN_AI_AGENT_MODELS = {
  'gpt-5': 'gpt-5-2025-08-07',
  'gpt-5-mini': 'gpt-5-mini-2025-08-07',
  'gpt-5-nano': 'gpt-5-nano-2025-08-07',
  'gpt-5-pro': 'gpt-5-pro-2025-10-06',
  'gpt-5-codex': 'gpt-5-codex',
  'gpt-4.1': 'gpt-4.1-2025-04-14',
  'gpt-4.1-mini': 'gpt-4.1-mini-2025-04-14',
  'gpt-4.1-nano': 'gpt-4.1-nano-2025-04-14',
  'o4-mini': 'o4-mini-2025-04-16',
  'gpt-oss-120b': 'gpt-oss-120b',
};
export const OPEN_AI_CHAT_MODELS = {
  'gpt-5': 'gpt-5-2025-08-07',
  'chatgpt-4o': 'chatgpt-4o-latest',
  o3: 'o3-2025-04-16',
  'o1-pro': 'o1-pro-2025-03-19',
  'gpt-4o-search-preview': 'gpt-4o-search-preview-2025-03-11',
  'gpt-4o': 'gpt-4o-2024-08-06',
  'gpt-4o-mini': 'gpt-4o-mini-2024-07-18',
  'gpt-4-turbo': 'gpt-4-0125-preview',
  'gpt-4': 'gpt-4-0613',
  'gpt-5-chat': 'gpt-5-chat-latest',
  'gpt-5-mini': 'gpt-5-mini-2025-08-07',
  'gpt-5-nano': 'gpt-5-nano-2025-08-07',
  'gpt-5-pro': 'gpt-5-pro-2025-10-06',
  'gpt-5-codex': 'gpt-5-codex',
  'gpt-4.1': 'gpt-4.1-2025-04-14',
  'gpt-4.1-mini': 'gpt-4.1-mini-2025-04-14',
  'gpt-4.1-nano': 'gpt-4.1-nano-2025-04-14',
  'o4-mini': 'o4-mini-2025-04-16',
  'gpt-oss-120b': 'gpt-oss-120b',
};

export const MODEL_NAMES_MAP = {
  'gpt-5-2025-08-07': 'gpt-5',
  'chatgpt-4o-latest': 'chatgpt-4o',
  'o3-2025-04-16': 'o3',
  'o1-pro-2025-03-19': 'o1-pro',
  'gpt-4o-search-preview-2025-03-11': 'gpt-4o-search-preview',
  'gpt-4o-2024-08-06': 'gpt-4o',
  'gpt-4o-mini-2024-07-18': 'gpt-4o-mini',
  'gpt-4-0125-preview': 'gpt-4-turbo',
  'gpt-4-0613': 'gpt-4',
  'gpt-5-chat-latest': 'gpt-5-chat',
  'gpt-5-mini-2025-08-07': 'gpt-5-mini',
  'gpt-5-nano-2025-08-07': 'gpt-5-nano',
  'gpt-5-pro-2025-10-06': 'gpt-5-pro',
  'gpt-5-codex': 'gpt-5-codex',
  'gpt-4.1-2025-04-14': 'gpt-4.1',
  'gpt-4.1-mini-2025-04-14': 'gpt-4.1-mini',
  'gpt-4.1-nano-2025-04-14': 'gpt-4.1-nano',
  'o4-mini-2025-04-16': 'o4-mini',
  'gpt-oss-120b': 'gpt-oss-120b',
};
