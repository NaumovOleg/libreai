import { tool } from '@langchain/core/tools';

import { AGENT_TOOLS, DeleteFileToolArgs } from '../../../utils';
import { Schemas } from './schemas';

export const deleteFile = tool(
  async (args: DeleteFileToolArgs) => {
    console.log('Deleting', args);

    return JSON.stringify({
      status: 'ok',
      action: 'deleteFile',
      taskId: args.taskId,
    });
  },
  {
    name: AGENT_TOOLS.deleteFile,
    description: 'Deletes existed file.',
    schema: Schemas[AGENT_TOOLS.deleteFile],
  },
);
