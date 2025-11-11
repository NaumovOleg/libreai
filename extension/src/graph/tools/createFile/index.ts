import { tool } from '@langchain/core/tools';
import { CreateToolArgs } from '@utils';

import { meta, schema } from './meta';
import { processor } from './processor';
export const create = tool<typeof schema, CreateToolArgs>(async (args) => {
  console.log('-------------', meta.name, args);
  try {
    const response = await processor(args);

    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return err.message;
  }
}, meta);
