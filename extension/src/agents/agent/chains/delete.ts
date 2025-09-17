import { ChatPromptTemplate } from '@langchain/core/prompts';
import { tool } from '@langchain/core/tools';
import { ChatOllama } from '@langchain/ollama';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { z } from 'zod';

import { PLANNER_PROMPT } from '../prompts';

const pr = PLANNER_PROMPT;

console.log(pr);

const llm = new ChatOllama({
  baseUrl: 'http://localhost:11434',
  model: 'llama3.1:8b',
});

const magicTool = tool(
  async ({ input }: { input: number }) => {
    console.log('_-------------------', input);
    return `${input + 2}`;
  },
  {
    name: 'magic_function',
    description: 'Applies a magic function to an input.',
    schema: z.object({
      input: z.number(),
    }),
  },
);

const tools = [magicTool];

const query = 'what is the value of magic_function(3)?';

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant'],
  ['placeholder', '{chat_history}'],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

const agent = createToolCallingAgent({
  llm,
  tools,
  prompt,
});
const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

const y = async () => {
  const resp = await agentExecutor.invoke({ input: query });
  console.log('++++++++====+++++', resp);
};
y();
