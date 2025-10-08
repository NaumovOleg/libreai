import { AGENT_TOOLS, AgentMessagePayload, CommandToolArgs, ToolCallbacks, uuid } from '@utils';
import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { Observer } from '../../../observer';
import { Schemas } from './schemas';

export class CommandTool {
  tool: FunctionTool<CommandToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.command]) {
    this.tool = tool({
      name: AGENT_TOOLS.command,
      description: 'Executes terminal command',
      parameters: Schemas[AGENT_TOOLS.command],
      execute: async (args: CommandToolArgs) => {
        const observer = Observer.getInstance();
        const event: AgentMessagePayload<'command'> = {
          id: uuid(4),
          args: { command: args.command },
          status: 'pending',
          type: 'command',
        };
        observer.emit('agent', event);
        console.log(`Executing command: ${args.command}`);
        event.status = 'done';

        await cb(args).catch((error) => {
          event.error = error.message;
          event.status = 'error';
        });

        observer.emit('agent', event);

        return { success: event.status === 'done', name: AGENT_TOOLS.command };
      },
    });
  }
}
