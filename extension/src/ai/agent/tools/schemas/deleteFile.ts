import { z } from 'zod';

import { file } from './properties';

export const DeleteFileSchema = z.object({
  file,
});
