import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';

export const openAi = new ChatOpenAI({
  model: 'deepseek/deepseek-chat-v3.1:free',
  temperature: 0.2,
  configuration: {
    apiKey: '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',
    baseURL: 'https://openrouter.ai/api/v1',
  },
});

export const ollama = new ChatOllama({
  baseUrl: 'http://localhost:11434',
  model: 'qwen2.5-coder:14b',
  temperature: 0,
});
