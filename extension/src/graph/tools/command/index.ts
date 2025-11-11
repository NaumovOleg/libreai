import { tool } from '@langchain/core/tools';
import { CommandToolArgs } from '@utils';

import { meta, schema } from './meta';

export const command = tool<typeof schema, string>(async (args: CommandToolArgs) => {
  console.log('-------------', meta.name, args);

  return 'args';
}, meta);
