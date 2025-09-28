import { ollama as llamaOllema } from '@llamaindex/ollama';

// export const openAiLlama = openai({
//   model: 'deepseek/deepseek-chat-v3.1:free',
//   temperature: 0.2,
//   apiKey: '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',
//   baseURL: 'https://openrouter.ai/api/v1',
// });

export const ollamaLlamaLocal = llamaOllema({
  config: { host: 'http://localhost:11434' },
  options: { temperature: 0.2, num_ctx: 32000 },
  model: 'llama3.1:8b',
});

export const chat = llamaOllema({
  config: { host: 'http://localhost:11434' },
  options: { temperature: 0 },
  model: 'llama3.1:8b',
});
