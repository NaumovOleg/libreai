import { tool } from '@langchain/core/tools';
import { EditFileToolArgs } from '@utils';

import { meta, schema } from './meta';
import { processor } from './processor';

export const edit = tool<typeof schema, EditFileToolArgs>(async (args) => {
  console.log('-------------', meta.name, args);
  try {
    await processor(args);

    return 'edited';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return err.message;
  }
}, meta);
