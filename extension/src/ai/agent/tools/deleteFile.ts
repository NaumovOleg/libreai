import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
import {
  AGENT_TOOLS,
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
        const event = { id: uuid(4), args: args.file };
        console.log('Deleting', args);
        observer.emit(EDITOR_EVENTS.deleteFile, { status: 'pending', ...event });
        let status = 'success';
        await cb(args).catch(() => (status = 'error'));

        observer.emit(EDITOR_EVENTS.createFile, { status: 'done', ...event });

        return JSON.stringify({
          status,
          tool: AGENT_TOOLS.deleteFile,
          taskId: args.taskId,
        });
      },
      name: AGENT_TOOLS.deleteFile,
      description: 'Deletes existed file.',
      parameters: Schemas[AGENT_TOOLS.deleteFile],
    });
  }
}
