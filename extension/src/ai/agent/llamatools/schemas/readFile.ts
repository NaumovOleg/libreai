import { z } from 'zod';

export const ReadFileSchema = z.object({
  file: z.string().describe('Full path to the file'),
  taskId: z.string().describe('ID of the task for tracking'),
});
