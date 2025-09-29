import { z } from 'zod';

import { content, file } from './properties';

export const CreateFileSchema = z.object({
  file,
  content,
});
