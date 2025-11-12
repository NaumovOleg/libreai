import { tool } from '@langchain/core/tools';
import { RenameFileToolArgs } from '@utils';

import { meta, schema } from './meta';
import { processor } from './processor';

export const rename = tool<typeof schema, RenameFileToolArgs>(async (args) => {
  console.log('TOOL----------->', meta.name, args);
  try {
    const response = await processor(args);

    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return `${err.name}. ${err.message}`;
  }
}, meta);
