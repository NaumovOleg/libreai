import { z } from 'zod';

import { AGENT_TOOLS } from '@utils';
import { content, file } from '../../helper';

export const schema = z.object({ file, content });

export const meta = {
  name: AGENT_TOOLS.createFile,
  description: `Creates a new file with provided content.`,
  schema,
};
