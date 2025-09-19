import { z } from 'zod';

export const RenameFileSchema = z.object({
  taskId: z.string().optional().describe('ID of the task for tracking'),
  file: z.string().describe('Full path to the file'),
  newName: z.string().describe('New name of file'),
});
