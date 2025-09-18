import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const deleteFile = tool(
  async (args: any) => {
    console.log('Deleting', args);

    return JSON.stringify({
      status: 'ok',
      action: 'deleteFile',
      taskId: args.taskId,
    });
  },
  {
    name: 'deleteFile',
    description: 'Can delete file',
    schema: z.object({
      taskId: z.string().optional().describe('ID of the task for tracking'),
      file: z.string().describe('Full path to the file'),
    }),
  },
);
