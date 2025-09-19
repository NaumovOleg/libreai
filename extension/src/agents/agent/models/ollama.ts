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
