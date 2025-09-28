import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
import { AGENT_TOOLS, CommandToolArgs, EDITOR_EVENTS, ToolCallbacks, uuid } from '../../../utils';
import { Schemas } from './schemas';

export class CommandTool {
  tool: FunctionTool<CommandToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.command]) {
    this.tool = tool({
      name: AGENT_TOOLS.command,
      description: 'Executes terminal command',
      parameters: Schemas[AGENT_TOOLS.command],
      execute: async (args: CommandToolArgs) => {
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

        return { status, name: AGENT_TOOLS.command };
      },
    });
  }
}
