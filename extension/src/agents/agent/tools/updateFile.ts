import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const updateFileTool = tool(
  async (args: any) => {
    console.log('Updating file----:', args);

    return JSON.stringify({ status: 'ok', action: 'editFile' });
  },
  {
    name: 'editFile',
    description: 'Can edit file',
    schema: z.object({
      file: z.string().describe('Full path to the file.'),
      content: z.string().describe('New content to insert. Required for insert and replace modes.'),
      command: z.string().optional().describe('Command to  execute'),
      startLine: z
        .number()
        .describe('Starting line number (0-indexed). Required for line operations.'),
      endLine: z.number().describe('Ending line number (0-indexed). Required for line operations.'),
      insertMode: z
        .enum(['insert', 'replace', 'delete'])
        .optional()
        .describe('insert: add new lines, replace: overwrite existing lines, delete: remove lines'),
    }),
  },
);
