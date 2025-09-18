import { tool } from '@langchain/core/tools';
import { z } from 'zod';
export const createFile = tool(
  async (args: any) => {
    console.log('Createing', args);

    return JSON.stringify({
      status: 'ok',
      action: 'createFile',
      ...args,
    });
  },
  {
    name: 'createFile',
    description: 'Can create new file',
    schema: z.object({
      file: z.string().describe('Full path to the file that should be created'),
      content: z
        .string()
        .describe('New content to insert. Required for insert and replace modes.')
        .optional(),
    }),
  },
);
