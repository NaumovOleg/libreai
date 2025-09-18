import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const updateFileTool = tool(
  async (args: any) => {
    console.log('Updating file----:', args);

    return JSON.stringify({ status: 'ok', action: 'editFile', taskId: args.taskId });
  },
  {
    name: 'editFile',
    description: 'Can edit file',
    schema: z.object({
      file: z.string().describe('Full path to the file'),
      startLine: z.number().describe('Starting line number (0-indexed)'),
      endLine: z.number().describe('Ending line number (0-indexed)'),
      insertMode: z.enum(['insert', 'replace', 'delete']).describe('Operation mode'),
      content: z.string().describe('Content for insert/replace.'),
      taskId: z.string().optional().describe('ID of the task for tracking'),
    }),
  },
);
