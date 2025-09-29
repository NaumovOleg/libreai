import { z } from 'zod';

import { file, newName } from './properties';

export const RenameFileSchema = z.object({
  file,
  newName,
});
