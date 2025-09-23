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
  model: 'llama3.1:8b',
  temperature: 0,
});

export const chat = new ChatOllama({
  baseUrl: 'http://localhost:11434',
  model: 'llama3.1:8b',
  temperature: 0,
  streaming: true,
});
