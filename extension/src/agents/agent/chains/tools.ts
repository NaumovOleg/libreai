// tools.ts
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
export const magicTool = tool(
  async ({ input }: { input: string }) => {
    console.log('magicTool+++++++++++++++++++++++++++', input);
    return input + 2;
  },
  {
    name: 'magic_function',
    description: 'Adds 2 to a number',
    schema: z.any(),
  },
);

export const echoTool = tool(
  async ({ input }: { input: string }) => {
    console.log('echoTool+++++++++++++++++++++++++++', input);
    return `Echo: ${input}`;
  },
  {
    name: 'echo_function',
    description: 'Returns the input string prefixed with Echo',
    schema: z.any(),
  },
);

export const tools = [magicTool, echoTool];
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
