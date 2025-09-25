import { z } from 'zod';

export const CommandSchema = z.object({
  taskId: z.string().describe('Id of current task'),
  command: z.string().describe('Command to  execute.'),
});
