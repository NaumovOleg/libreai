import { z } from 'zod';

import { content, file } from './properties';

export const EditFileSchema = z.object({ file, content }).describe(
  `*** TOOL INPUT RULES ***
1. The "content" field must contain WHOLE file content.
   - Escape special characters (\\n, quotes, etc.).`,
);
