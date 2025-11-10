import { z } from 'zod';

import { AGENT_TOOLS } from '@utils';
import { content, file } from '../../helper';

export const schema = z.object({ file, content }).describe(
  `*** TOOL INPUT RULES ***
1. The "content" field must contain WHOLE file content.
   - Escape special characters (\\n, quotes, etc.).`,
);

export const meta = {
  name: AGENT_TOOLS.editFile,
  description: `Edit a file with content.`,
  schema,
};
