import { AGENT_TOOLS } from '@utils';
import { z } from 'zod';

import { command } from '../../helper';

export const schema = z.object({ command });

export const meta = {
  name: AGENT_TOOLS.command,
  description: 'Executes terminal command',
  schema,
};
