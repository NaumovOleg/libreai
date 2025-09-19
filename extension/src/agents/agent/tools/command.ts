import { tool } from '@langchain/core/tools';

import { AGENT_TOOLS, CommandToolArgs } from '../../../utils';
import { Schemas } from './schemas';

export const executeCommandTool = tool(
  async ({ command, taskId }: CommandToolArgs) => {
    console.log(`Executing command: ${command}`);
    // тут можно дернуть child_process.spawn
    return JSON.stringify({ status: 'ok', action: 'command', taskId });
  },
  {
    name: AGENT_TOOLS.commang,
    description: 'Executes terminal command',
    schema: Schemas[AGENT_TOOLS.commang],
  },
);
