import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { EditorObserver } from '../../../observer';
import { AGENT_TOOLS, CreateToolArgs, EDITOR_EVENTS, ToolCallbacks } from '../../../utils';
import { Schemas } from './schemas';
export class CreateFileTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.createFile]) {
    this.tool = tool(
      async (args: CreateToolArgs) => {
        const observer = EditorObserver.getInstance();
        console.log('Creating', args);
        observer.emit(EDITOR_EVENTS.createFile, { status: 'pending', args: args.file });
        let status = 'success';
        await cb(args).catch(() => (status = 'error'));
        observer.emit(EDITOR_EVENTS.createFile, { status: 'done', args: args.file });

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
