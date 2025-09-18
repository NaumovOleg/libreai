import { tool } from '@langchain/core/tools';
import { z } from 'zod';
export const executeCommandTool = tool(
  async ({ command }: any) => {
    console.log(`Executing command: ${command}`);
    // тут можно дернуть child_process.spawn
    return JSON.stringify({ status: 'ok', action: 'command', command });
  },
  {
    name: 'command',
    description: 'Can execute command',
    schema: z.object({
      command: z.string().describe('Command to  execute.'),
    }),
  },
);
