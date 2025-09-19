import { tool } from '@langchain/core/tools';

import { AGENT_TOOLS, CreateToolArgs } from '../../../utils';
import { Schemas } from './schemas';

export const createFile = tool(
  async (args: CreateToolArgs) => {
    console.log('Creating', args);

    return JSON.stringify({
      status: 'ok',
      action: 'createFile',
      taskId: args.taskId,
    });
  },
  {
    name: AGENT_TOOLS.createFile,
    description: 'Creates a new file with provided content.',
    schema: Schemas[AGENT_TOOLS.createFile],
  },
);
