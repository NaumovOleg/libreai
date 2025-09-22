import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { EditorObserver } from '../../../observer';
import { AGENT_TOOLS, EDITOR_EVENTS, RenameFileToolArgs, ToolCallbacks } from '../../../utils';
import { Schemas } from './schemas';
export class RenameFileTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.renameFile]) {
    this.tool = tool(
      async (args: RenameFileToolArgs) => {
        const observer = EditorObserver.getInstance();
        console.log('Renamin file', args);
        observer.emit(EDITOR_EVENTS.renameFile, { status: 'pending', args: args.file });
        let status = 'success';
        await cb(args).catch(() => (status = 'error'));
        observer.emit(EDITOR_EVENTS.renameFile, { status: 'done', args: args.file });
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
