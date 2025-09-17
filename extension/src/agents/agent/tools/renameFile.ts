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
    description: 'Rename existing file.',
    schema: z.object({
      file: z.string(),
      content: z.string(),
      startLine: z.number(),
      endLine: z.number(),
      insertMode: z.enum(['insert', 'replace', 'delete']),
      newName: z.string().optional(),
    }),
  },
);
