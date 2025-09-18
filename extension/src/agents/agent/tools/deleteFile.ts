import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const deleteFile = tool(
  async (args: any) => {
    console.log('Deleting', args);

    return JSON.stringify({
      status: 'ok',
      action: 'deleteFile',
      ...args,
    });
  },
  {
    name: 'deleteFile',
    description: 'Can delete file',
    schema: z.object({
      file: z.string().describe('Full path to the file that should be deleted.'),
    }),
  },
);
