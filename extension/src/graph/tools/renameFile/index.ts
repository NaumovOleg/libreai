import { tool } from '@langchain/core/tools';
import { RenameFileToolArgs } from '@utils';
import { meta, schema } from './meta';

export const rename = tool<typeof schema, RenameFileToolArgs>(async (args) => {
  console.log('-------------', meta.name, args);
  return 'args';
}, meta);
