import { z } from 'zod';

export const RenameFileSchema = z.object({
  file: z.string().describe('Full path to the file'),
  newName: z.string().describe('New name of file'),
});
