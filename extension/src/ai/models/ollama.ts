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

const personal = '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';

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
