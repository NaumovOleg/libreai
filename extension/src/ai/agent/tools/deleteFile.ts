import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
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
        const observer = EditorObserver.getInstance();
        const event: Omit<AgentMessagePayload<'deleteFile'>, 'type'> = {
          id: uuid(4),
          args: { file: args.file },
          status: 'pending',
        };
        console.log('Deleting', args);
        observer.emit(EDITOR_EVENTS.deleteFile, event);
        event.status = 'done';
        await cb(args).catch((err) => {
          event.error = err.message;
          event.status = 'error';
        });

        observer.emit(EDITOR_EVENTS.deleteFile, event);

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
