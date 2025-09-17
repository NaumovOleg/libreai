import { createOpenAI } from '@ai-sdk/openai';
import { Agent, createTool } from '@voltagent/core';
import { z } from 'zod';

const model = createOpenAI({
  baseURL: 'ssss',
  apiKey: 'dddd',
});

const echoTool = createTool({
  name: 'echo',
  description: 'Echoes the input text back',
  inputSchema: z.string(), // ожидается строка
  outputSchema: z.string(),
  handler: async (input: string) => {
    return `You said: ${input}`;
  },
});

// Можно добавить тулзу для файлов, поиска, БД и т.д.
// Например:
const reverseTool = createTool({
  name: 'reverse',
  description: 'Reverses the input text',
  inputSchema: z.string(),
  outputSchema: z.string(),
  handler: async (input: string) => {
    return input.split('').reverse().join('');
  },
}); // гипотетический импорт; может различаться

// --- 3. Создание агента ---

const agent = new Agent({
  name: 'local_agent',
  instructions: 'You are a helpful assistant. Use tools when needed.',
  llm: new CustomVoltAgentModel(), // или провайдер, если VoltAgent поддерживает эту опцию
  tools: [echoTool, reverseTool],
  // можно добавить память, если нужно:
  // memory: new SomeMemoryAdapter(...)
});

// --- 4. Использование агента ---

async function runAgent(input: string) {
  const result = await agent.generateText(input);
  console.log('Agent says:', result);
}

// Примеры:

(async () => {
  await runAgent('Hello!');
  await runAgent('reverse Hello!');
  await runAgent('echo This is a test');
})();
