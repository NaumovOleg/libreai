import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
import {
  AGENT_TOOLS,
  AgentMessagePayload,
  CommandToolArgs,
  EDITOR_EVENTS,
  ToolCallbacks,
  uuid,
} from '../../../utils';
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
        const event: Omit<AgentMessagePayload<'command'>, 'type'> = {
          id: uuid(4),
          args: { command: args.command },
          status: 'pending',
        };
        observer.emit(EDITOR_EVENTS.command, event);
        console.log(`Executing command: ${args.command}`);
        event.status = 'done';

        await cb(args).catch((error) => {
          event.error = error.message;
          event.status = 'error';
        });

        observer.emit(EDITOR_EVENTS.command, event);

        return { success: event.status === 'done', name: AGENT_TOOLS.command };
      },
    });
  }
}
