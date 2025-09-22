import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { EditorObserver } from '../../../observer';
import { AGENT_TOOLS, EditFileToolArgs, EDITOR_EVENTS, ToolCallbacks } from '../../../utils';
import { Schemas } from './schemas';

export class EditFileTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.editFile], observer: EditorObserver) {
    this.tool = tool(
      async (args: EditFileToolArgs) => {
        console.log('Updating file:', args, cb);
        observer.emit(EDITOR_EVENTS.editFile, { status: 'pending', args: args.file });
        let status = 'success';

        await cb(args).catch(() => (status = 'error'));
        observer.emit(EDITOR_EVENTS.editFile, { status: 'done', args: args.file });
        return JSON.stringify({
          status,
          taskId: args.taskId,
          tool: AGENT_TOOLS.editFile,
        });
      },
      {
        name: AGENT_TOOLS.editFile,
        description: `Edit a file at specific lines using one of three modes.
IMPORTANT!!!: Focus on correct calculation of startLine, endLine, insertMode and code snipped.`,
        schema: Schemas[AGENT_TOOLS.editFile],
      },
    );
  }
}
