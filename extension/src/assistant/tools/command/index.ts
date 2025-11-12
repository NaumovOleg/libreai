import { tool } from '@langchain/core/tools';
import { waitForUserConfirmation } from '@services';
import { CommandToolArgs, DECLINED_COMMAND_MESSAGE } from '@utils';

import { meta, schema } from './meta';
import { processor } from './processor';
export const command = tool<typeof schema, string>(async (args: CommandToolArgs, { toolCall }) => {
  console.log('TOOL----------->', meta.name, args);

  try {
    const isConfirmed = await waitForUserConfirmation(toolCall.id);
    if (!isConfirmed) {
      return DECLINED_COMMAND_MESSAGE;
    }
    const response = await processor(args);

    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return { error: `${err.name}. ${err.message}` };
  }
}, meta);
