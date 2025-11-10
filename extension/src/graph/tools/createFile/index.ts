import { tool } from '@langchain/core/tools';
import { CreateToolArgs } from '@utils';
import { meta, schema } from './meta';

export const create = tool<typeof schema, CreateToolArgs>(async (args) => {
  console.log('-------------', meta.name, args);
  return 'args';
}, meta);
