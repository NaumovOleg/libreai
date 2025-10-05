import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { Observer } from '../../../observer';
import {
  AGENT_TOOLS,
  AgentMessagePayload,
  DeleteFileToolArgs,
  EDITOR_EVENTS,
  ToolCallbacks,
  uuid,
} from '../../../utils';
import { Schemas } from './schemas';

export class DeleteFileTool {
  tool: FunctionTool<DeleteFileToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.deleteFile]) {
    this.tool = tool({
      execute: async (args: DeleteFileToolArgs) => {
        const observer = Observer.getInstance();
        const event: AgentMessagePayload<'deleteFile'> = {
          id: uuid(4),
          args: { file: args.file },
          status: 'pending',
          type: 'deleteFile',
        };
        console.log('Deleting', args);
        observer.emit('agent', event);
        event.status = 'done';
        await cb(args).catch((err) => {
          event.error = err.message;
          event.status = 'error';
        });

        observer.emit('agent', event);

        return JSON.stringify({
          success: (event.status = 'done'),
          name: EDITOR_EVENTS.deleteFile,
          file: args.file,
        });
      },
      name: AGENT_TOOLS.deleteFile,
      description: 'Deletes existed file.',
      parameters: Schemas[AGENT_TOOLS.deleteFile],
    });
  }
}
