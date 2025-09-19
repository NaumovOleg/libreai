import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { AGENT_TOOLS, DeleteFileToolArgs, ToolCallbacks } from '../../../utils';
import { Schemas } from './schemas';

export class DeleteFileTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.deleteFile]) {
    this.tool = tool(
      async (args: DeleteFileToolArgs) => {
        console.log('Deleting', args);
        let status = 'success';
        await cb(args).catch(() => (status = 'error'));

        return JSON.stringify({
          status,
          tool: AGENT_TOOLS.deleteFile,
          taskId: args.taskId,
        });
      },
      {
        name: AGENT_TOOLS.deleteFile,
        description: 'Deletes existed file.',
        schema: Schemas[AGENT_TOOLS.deleteFile],
      },
    );
  }
}
