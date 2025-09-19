import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { AGENT_TOOLS, RenameFileToolArgs, ToolCallbacks } from '../../../utils';
import { Schemas } from './schemas';

export class RenameFileTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.renameFile]) {
    this.tool = tool(
      async (args: RenameFileToolArgs) => {
        console.log('Renamin file', args);
        let status = 'success';
        await cb(args).catch(() => (status = 'error'));
        return JSON.stringify({
          status,
          tool: AGENT_TOOLS.renameFile,
          taskId: args.taskId,
        });
      },
      {
        name: AGENT_TOOLS.renameFile,
        description: 'Renames existed file',
        schema: Schemas[AGENT_TOOLS.renameFile],
      },
    );
  }
}
