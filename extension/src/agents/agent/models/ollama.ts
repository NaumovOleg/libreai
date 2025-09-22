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
  model: 'qwen2.5-coder:7b',
  temperature: 0,
});
