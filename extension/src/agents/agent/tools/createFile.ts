import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { AGENT_TOOLS, CreateToolArgs, ToolCallbacks } from '../../../utils';
import { Schemas } from './schemas';

export class CreateFileTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.createFile]) {
    this.tool = tool(
      async (args: CreateToolArgs) => {
        console.log('Creating', args);
        let status = 'success';
        await cb(args).catch(() => (status = 'error'));

        return JSON.stringify({
          status,
          tool: 'createFile',
          taskId: args.taskId,
        });
      },
      {
        name: AGENT_TOOLS.createFile,
        description: 'Creates a new file with provided content.',
        schema: Schemas[AGENT_TOOLS.createFile],
      },
    );
  }
}
