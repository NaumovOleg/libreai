import { ollama as llamaOllema } from '@llamaindex/ollama';
import { openai } from '@llamaindex/openai';

export const openAiLlama = openai({
  model: 'deepseek/deepseek-chat-v3.1:free',
  temperature: 0.2,
  apiKey: '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',
  baseURL: 'https://openrouter.ai/api/v1',
});

// ollama  e1d2cfae51fb4e82a50b68d2e3eaa067.X-Pp5fCiNsMCqqxRr5NBdPt5

export const ollamaLlama = llamaOllema({
  config: {
    // host: 'http://localhost:11434',
    host: 'https://ollama.com',
    headers: {
      Authorization: 'Bearer e1d2cfae51fb4e82a50b68d2e3eaa067.X-Pp5fCiNsMCqqxRr5NBdPt5',
    },
  },
  options: {
    temperature: 0,
    num_ctx: 120000,
  },
  // model: 'llama3.1:8b',
  model: 'deepseek-v3.1:671b-cloud',
});
export const ollamaLlamaLocal = llamaOllema({
  config: { host: 'http://localhost:11434' },
  options: { temperature: 0, num_ctx: 32000 },
  model: 'llama3.1:8b',
});

export const chat = llamaOllema({
  config: { host: 'http://localhost:11434' },
  options: { temperature: 0 },
  model: 'llama3.1:8b',
});
