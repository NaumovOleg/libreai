import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
import { AGENT_TOOLS, EditFileToolArgs, EDITOR_EVENTS, ToolCallbacks, uuid } from '../../../utils';
import { Schemas } from './schemas';

export class EditFileTool {
  tool: FunctionTool<EditFileToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.editFile]) {
    this.tool = tool({
      execute: async (args: EditFileToolArgs) => {
        const observer = EditorObserver.getInstance();
        const taskid = uuid(4);
        const event = { id: uuid(4), args: { file: args.file, content: args.content } };
        console.log('Updating file:', args, cb);
        observer.emit(EDITOR_EVENTS.editFile, {
          status: 'pending',
          id: taskid,
          args: {
            file: args.file,
            content: args.content,
          },
        });

        let status = 'done';
        let success = true;

        await cb(args).catch(() => {
          success = false;
          status = 'error';
        });
        observer.emit(EDITOR_EVENTS.editFile, { status, id: taskid });
        return JSON.stringify({ success, name: AGENT_TOOLS.editFile });
      },

      name: AGENT_TOOLS.editFile,
      description: `Edit a file with content.
     IMPORTANT: Only call editFile if this content is DIFFERENT from the current file content.`,
      parameters: Schemas[AGENT_TOOLS.editFile],
    });
  }
}
