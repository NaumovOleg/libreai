import { z } from 'zod';

import { command } from './properties';

export const CommandSchema = z.object({
  command,
});
