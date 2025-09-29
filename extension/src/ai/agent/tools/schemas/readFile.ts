import { z } from 'zod';

import { file } from './properties';

export const ReadFileSchema = z.object({
  file,
});
