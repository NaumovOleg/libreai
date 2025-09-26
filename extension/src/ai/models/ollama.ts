import { ollama as llamaOllema } from '@llamaindex/ollama';
import { openai } from '@llamaindex/openai';

import { Conf } from '../../utils';

export const openAiLlama = openai({
  model: 'deepseek/deepseek-chat-v3.1:free',
  temperature: 0.2,
  apiKey: Conf.chatConfig.apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
});

export const ollamaLlama = llamaOllema({
  config: {
    host: 'http://localhost:11434',
  },
  options: {
    temperature: 0,
  },
  model: 'llama3.1:8b',
  // model: 'qwen2.5-coder:7b',
});

export const chat = llamaOllema({
  config: {
    host: 'http://localhost:11434',
  },
  options: {
    temperature: 0,
  },
  model: 'llama3.1:8b',
});
