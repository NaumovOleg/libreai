import { tool } from '@langchain/core/tools';
import { z } from 'zod';
export const createFile = tool(
  async (args: any) => {
    console.log('Createing', args);

    return JSON.stringify({
      status: 'ok',
      action: 'createFile',
      taskId: args.taskId,
    });
  },
  {
    name: 'createFile',
    description: 'Can create new file',
    schema: z.object({
      taskId: z.string().optional().describe('ID of the task for tracking'),
      file: z.string().describe('Full path to the file'),
      content: z.string().describe('Content for insert.'),
    }),
  },
);
