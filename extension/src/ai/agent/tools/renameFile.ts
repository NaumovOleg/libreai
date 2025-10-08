import {
  AGENT_TOOLS,
  AgentMessagePayload,
  EDITOR_EVENTS,
  RenameFileToolArgs,
  ToolCallbacks,
  uuid,
} from '@utils';
import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { Observer } from '../../../observer';
import { Schemas } from './schemas';
export class RenameFileTool {
  tool: FunctionTool<RenameFileToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.renameFile]) {
    this.tool = tool({
      execute: async (args: RenameFileToolArgs) => {
        const observer = Observer.getInstance();
        const event: AgentMessagePayload<'renameFile'> = {
          id: uuid(4),
          args: { file: args.file, newName: args.newName },
          status: 'pending',
          type: 'renameFile',
        };
        console.log('Renamin file', args);
        observer.emit('agent', event);
        event.status = 'done';

        await cb(args).catch((err) => {
          event.error = err.message;
          event.status = 'error';
        });

        observer.emit('agent', event);
        return {
          success: event.status === 'done',
          name: EDITOR_EVENTS.renameFile,
          file: args.file,
          newName: args.newName,
        };
      },

      name: AGENT_TOOLS.renameFile,
      description: 'Renames existed file',
      parameters: Schemas[AGENT_TOOLS.renameFile],
    });
  }
}
