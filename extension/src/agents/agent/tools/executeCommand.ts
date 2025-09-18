import { tool } from '@langchain/core/tools';
import { z } from 'zod';
export const executeCommandTool = tool(
  async ({ command, taskId }: any) => {
    console.log(`Executing command: ${command}`);
    // тут можно дернуть child_process.spawn
    return JSON.stringify({ status: 'ok', action: 'command', taskId });
  },
  {
    name: 'command',
    description: 'Can execute command',
    schema: z.object({
      taskId: z.string().describe('Id of current task'),
      command: z.string().describe('Command to  execute.'),
    }),
  },
);
