import { z } from 'zod';

import { AGENT_TOOLS } from '@utils';
import { file } from '../../helper';

export const schema = z.object({
  file,
});

export const meta = {
  name: AGENT_TOOLS.deleteFile,
  description: `Deletes existed file.`,
  schema,
};
