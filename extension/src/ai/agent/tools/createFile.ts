import {
  AGENT_TOOLS,
  AgentMessagePayload,
  CreateToolArgs,
  EDITOR_EVENTS,
  ToolCallbacks,
  uuid,
} from '@utils';
import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { Observer } from '../../../observer';
import { Schemas } from './schemas';

export class CreateFileTool {
  tool: FunctionTool<CreateToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.createFile]) {
    this.tool = tool({
      execute: async (args: CreateToolArgs) => {
        const observer = Observer.getInstance();
        const event: AgentMessagePayload<'createFile'> = {
          id: uuid(4),
          args: { file: args.file, content: args.content },
          status: 'pending',
          type: 'createFile',
        };
        console.log('Creating', args);
        observer.emit('agent', event);
        event.status = 'done';
        await cb(args).catch((err) => {
          event.error = err.message;
          event.status = 'error';
        });

        observer.emit('agent', event);

        return {
          success: (event.status = 'done'),
          name: EDITOR_EVENTS.createFile,
          file: args.file,
        };
      },
      name: AGENT_TOOLS.createFile,
      description: 'Creates a new file with provided content.',
      parameters: Schemas[AGENT_TOOLS.createFile],
    });
  }
}
