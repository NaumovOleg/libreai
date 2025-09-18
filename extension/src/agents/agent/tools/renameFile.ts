import { tool } from '@langchain/core/tools';
import { z } from 'zod';
export const renameFile = tool(
  async (args: any) => {
    console.log('Renamin file', args);

    return JSON.stringify({
      status: 'ok',
      action: 'renameFile',
      ...args,
    });
  },
  {
    name: 'renameFile',
    description: 'Can rename file',
    schema: z.object({
      file: z.string().describe('Full path to the file that should be renamed'),
      newName: z.string().describe('New name of file'),
    }),
  },
);
