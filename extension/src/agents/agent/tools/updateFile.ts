import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const updateFileTool = tool(
  async (args: any) => {
    console.log('Updating file----:', args);

    return JSON.stringify({ status: 'ok', action: 'updateFile' });
  },
  {
    name: 'updateFile',
    description: 'Update an existing file.',
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
