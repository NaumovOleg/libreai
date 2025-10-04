import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
import {
  AGENT_TOOLS,
  AgentMessagePayload,
  EditFileToolArgs,
  EDITOR_EVENTS,
  ToolCallbacks,
  uuid,
} from '../../../utils';
import { Schemas } from './schemas';

export class EditFileTool {
  tool: FunctionTool<EditFileToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.editFile]) {
    this.tool = tool({
      execute: async (args: EditFileToolArgs) => {
        const observer = EditorObserver.getInstance();

        const event: Omit<AgentMessagePayload<'editFile'>, 'type'> = {
          status: 'pending',
          id: uuid(4),
          error: undefined,
          args: { file: args.file, content: args.content },
        };
        console.log('Updating file:', args);
        observer.emit(EDITOR_EVENTS.editFile, event);

        event.status = 'done';

        const editResponse = await cb(args).catch((err) => {
          event.status = 'error';
          event.error = err.message;
        });

        event.args.old = editResponse?.old;

        observer.emit(EDITOR_EVENTS.editFile, event);
        return { success: event.status === 'done', name: AGENT_TOOLS.editFile, file: args.file };
      },
      name: AGENT_TOOLS.editFile,
      description: `Edit a file with content.
     IMPORTANT: Only call editFile if this content is DIFFERENT from the current file content.`,
      parameters: Schemas[AGENT_TOOLS.editFile],
    });
  }
}
