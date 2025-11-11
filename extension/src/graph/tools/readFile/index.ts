import { tool } from '@langchain/core/tools';
import { ReadFileToolArgs } from '@utils';

import { meta, schema } from './meta';
import { processor } from './processor';
export const read = tool<typeof schema, ReadFileToolArgs>(async (args) => {
  try {
    const response = await processor(args.file);

    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return err.message;
  }
}, meta);
