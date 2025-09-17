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
    description: 'Create new file.',
    schema: z.object({
      file: z.string(),
      content: z.string(),
      startLine: z.number().optional(),
      endLine: z.number().optional(),
    }),
  },
);
