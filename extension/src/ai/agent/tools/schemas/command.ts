import { z } from 'zod';

export const CommandSchema = z.object({
  command: z.string().describe('Command to  execute.'),
});
