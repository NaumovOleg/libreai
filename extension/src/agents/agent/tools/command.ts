import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { AGENT_TOOLS, CommandToolArgs, ToolCallbacks } from '../../../utils';
import { Schemas } from './schemas';

export class CommandTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.commang]) {
    this.tool = tool(
      async (args: CommandToolArgs) => {
        console.log(`Executing command: ${args.command}`);

        let status = 'success';
        await cb(args).catch(() => {
          status = 'error';
        });

        return JSON.stringify({ status, tool: AGENT_TOOLS.commang, taskId: args.taskId });
      },
      {
        name: AGENT_TOOLS.commang,
        description: 'Executes terminal command',
        schema: Schemas[AGENT_TOOLS.commang],
      },
    );
  }
}
