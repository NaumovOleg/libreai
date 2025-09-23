import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { EditorObserver } from '../../../observer';
import { AGENT_TOOLS, CommandToolArgs, EDITOR_EVENTS, ToolCallbacks, uuid } from '../../../utils';
import { Schemas } from './schemas';

export class CommandTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.command]) {
    this.tool = tool(
      async (args: CommandToolArgs) => {
        const observer = EditorObserver.getInstance();
        const event = { id: uuid(4), args: args.command };
        observer.emit(EDITOR_EVENTS.command, { status: 'pending', ...event });
        console.log(`Executing command: ${args.command}`);

        let status = 'success';
        await cb(args).catch(() => {
          status = 'error';
          observer.emit(EDITOR_EVENTS.command, { status: 'error', ...event });
        });
        if (status === 'success') {
          observer.emit(EDITOR_EVENTS.command, { status: 'done', ...event });
        }

        return JSON.stringify({ status, tool: AGENT_TOOLS.command, taskId: args.taskId });
      },
      {
        name: AGENT_TOOLS.command,
        description: 'Executes terminal command',
        schema: Schemas[AGENT_TOOLS.command],
      },
    );
  }
}
