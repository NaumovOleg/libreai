import { z } from 'zod';

export const DeleteFileSchema = z.object({
  file: z.string().describe('Full path to the file'),
});
