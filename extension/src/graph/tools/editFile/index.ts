import { tool } from '@langchain/core/tools';
import { EditFileToolArgs } from '@utils';
import { meta, schema } from './meta';

export const edit = tool<typeof schema, EditFileToolArgs>(async (args) => {
  console.log('-------------', meta.name, args);
  return 'args';
}, meta);
