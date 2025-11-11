import { tool } from '@langchain/core/tools';
import { DeleteFileToolArgs } from '@utils';

import { meta, schema } from './meta';

export const remove = tool<typeof schema, DeleteFileToolArgs>(async (args) => {
  console.log('-------------', meta.name, args);
  return 'args';
}, meta);
