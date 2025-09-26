import { z } from 'zod';

export const CreateFileSchema = z.object({
  file: z.string().describe('Full path to the file'),
  content: z.string().optional().describe('Content for insert.'),
});
