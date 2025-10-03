import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
import {
  AGENT_TOOLS,
  EditFileToolArgs,
  EDITOR_EVENTS,
  ObserverStatus,
  ToolCallbacks,
  uuid,
} from '../../../utils';
import { Schemas } from './schemas';

type Event = {
  status: ObserverStatus;
  id: string;
  error?: string;
  args: { file: string; content: string; old?: string };
};

export class EditFileTool {
  tool: FunctionTool<EditFileToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.editFile]) {
    this.tool = tool({
      execute: async (args: EditFileToolArgs) => {
        const observer = EditorObserver.getInstance();

        const event: Event = {
          status: 'pending' as ObserverStatus,
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
        return { success: event.status === 'done', name: AGENT_TOOLS.editFile };
      },
      name: AGENT_TOOLS.editFile,
      description: `Edit a file with content.
     IMPORTANT: Only call editFile if this content is DIFFERENT from the current file content.`,
      parameters: Schemas[AGENT_TOOLS.editFile],
    });
  }
}
