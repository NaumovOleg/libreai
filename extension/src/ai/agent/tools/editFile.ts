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
        const event = { id: uuid(4), args: { file: args.file, content: args.content } };
        console.log('Updating file:', args, cb);
        observer.emit(EDITOR_EVENTS.editFile, { status: 'pending', ...event });
        let status = 'success';

        await cb(args).catch(() => (status = 'error'));
        observer.emit(EDITOR_EVENTS.editFile, { status: 'done', ...event });
        return JSON.stringify({ status, tool: AGENT_TOOLS.editFile });
      },

      name: AGENT_TOOLS.editFile,
      description: `Edit a file at specific lines using one of three modes.
IMPORTANT!!!: Focus on correct calculation of startLine, endLine, insertMode and code snipped.`,
      parameters: Schemas[AGENT_TOOLS.editFile],
    });
  }
}
