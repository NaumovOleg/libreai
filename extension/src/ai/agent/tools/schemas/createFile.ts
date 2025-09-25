import { z } from 'zod';

export const CreateFileSchema = z.object({
  taskId: z.string().describe('ID of the task for tracking'),
  file: z.string().describe('Full path to the file'),
  content: z.string().optional().describe('Content for insert.'),
});
