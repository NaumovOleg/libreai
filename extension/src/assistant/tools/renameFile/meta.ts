import { z } from 'zod';

import { AGENT_TOOLS } from '@utils';
import { file, newName } from '../../helper';

export const schema = z.object({
  file,
  newName,
});

export const meta = {
  name: AGENT_TOOLS.renameFile,
  description: `Renames existed file.`,
  schema,
};
