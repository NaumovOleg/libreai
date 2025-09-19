import { tool } from '@langchain/core/tools';

import { AGENT_TOOLS, RenameFileToolArgs } from '../../../utils';
import { Schemas } from './schemas';

export const renameFile = tool(
  async (args: RenameFileToolArgs) => {
    console.log('Renamin file', args);

    return JSON.stringify({
      status: 'ok',
      action: 'renameFile',
      taskId: args.taskId,
    });
  },
  {
    name: AGENT_TOOLS.renameFile,
    description: 'Renames existed file',
    schema: Schemas[AGENT_TOOLS.renameFile],
  },
);
