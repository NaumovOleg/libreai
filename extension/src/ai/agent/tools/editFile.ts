import { AGENT_TOOLS, AgentMessagePayload, EditFileToolArgs, ToolCallbacks, uuid } from '@utils';
import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { Observer } from '../../../observer';
import { Schemas } from './schemas';

export class EditFileTool {
  tool: FunctionTool<EditFileToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.editFile]) {
    this.tool = tool({
      execute: async (args: EditFileToolArgs) => {
        const observer = Observer.getInstance();

        const event: AgentMessagePayload<'editFile'> = {
          status: 'pending',
          id: uuid(4),
          error: undefined,
          args: { file: args.file, content: args.content },
          type: 'editFile',
        };
        console.log('Updating file:', args);
        observer.emit('agent', event);

        event.status = 'done';

        const editResponse = await cb(args).catch((err) => {
          event.status = 'error';
          event.error = err.message;
        });

        event.args.old = editResponse?.old;

        observer.emit('agent', event);
        return { success: event.status === 'done', name: AGENT_TOOLS.editFile, file: args.file };
      },
      name: AGENT_TOOLS.editFile,
      description: `Edit a file with content.
     IMPORTANT: Only call editFile if this content is DIFFERENT from the current file content.`,
      parameters: Schemas[AGENT_TOOLS.editFile],
    });
  }
}
