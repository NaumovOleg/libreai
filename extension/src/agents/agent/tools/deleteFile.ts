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
    description: 'Delete existing file',
    schema: z.object({
      file: z.string().optional(),
      content: z.string().optional(),
      startLine: z.number().optional(),
      endLine: z.number().optional(),
      insertMode: z.enum(['insert', 'replace', 'delete']).optional(),
    }),
  },
);
