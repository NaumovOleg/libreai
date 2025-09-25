import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { ollama as llamaOllema } from '@llamaindex/ollama';
import { openai } from '@llamaindex/openai';
export const openAi = new ChatOpenAI({
  model: 'deepseek/deepseek-chat-v3.1:free',
  temperature: 0.2,
  configuration: {
    apiKey: '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',
    baseURL: 'https://openrouter.ai/api/v1',
  },
});
export const openAiLlama = openai({
  model: 'deepseek/deepseek-chat-v3.1:free',
  temperature: 0.2,
  apiKey: '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',
  baseURL: 'https://openrouter.ai/api/v1',
});

export const ollama = new ChatOllama({
  baseUrl: 'http://localhost:11434',
  model: 'llama3.1:8b',
  temperature: 0,
});

export const ollamaLlama = llamaOllema({
  config: {
    host: 'http://localhost:11434',
  },
  options: {
    temperature: 0,
  },
  model: 'llama3.1:8b',
});

export const chat = new ChatOllama({
  baseUrl: 'http://localhost:11434',
  model: 'llama3.1:8b',
  temperature: 0,
  streaming: true,
});
