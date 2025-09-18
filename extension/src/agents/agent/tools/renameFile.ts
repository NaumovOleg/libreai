import { tool } from '@langchain/core/tools';
import { z } from 'zod';
export const renameFile = tool(
  async (args: any) => {
    console.log('Renamin file', args);

    return JSON.stringify({
      status: 'ok',
      action: 'renameFile',
      taskId: args.taskId,
    });
  },
  {
    name: 'renameFile',
    description: 'Can rename file',
    schema: z.object({
      taskId: z.string().optional().describe('ID of the task for tracking'),
      file: z.string().describe('Full path to the file'),
      newName: z.string().describe('New name of file'),
    }),
  },
);
