import { tool } from '@langchain/core/tools';
import { z } from 'zod';
export const executeCommandTool = tool(
  async ({ command }: any) => {
    console.log(`Executing command: ${command}`);
    // тут можно дернуть child_process.spawn
    return JSON.stringify({ status: 'ok', action: 'executeCommand', command });
  },
  {
    name: 'executeCommand',
    description: 'Execute command',
    schema: z.object({
      content: z.string(),
    }),
  },
);
