import { tool } from '@langchain/core/tools';
import { ReadFileToolArgs } from '@utils';

import { meta, schema } from './meta';

export const read = tool<typeof schema, ReadFileToolArgs>(async (args) => {
  console.log('-------------', meta.name, args);
  return 'args';
}, meta);
