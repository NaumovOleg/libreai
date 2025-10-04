import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
import {
  AGENT_TOOLS,
  AgentMessagePayload,
  DeleteFileToolArgs,
  EDITOR_EVENTS,
  ObserverStatus,
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
          status: ObserverStatus.pending,
        };
        console.log('Deleting', args);
        observer.emit(EDITOR_EVENTS.deleteFile, event);
        event.status = ObserverStatus.done;
        await cb(args).catch((err) => {
          event.error = err.message;
          event.status = ObserverStatus.error;
        });

        observer.emit(EDITOR_EVENTS.deleteFile, event);

        return JSON.stringify({
          success: (event.status = ObserverStatus.done),
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
