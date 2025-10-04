import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
import {
  AGENT_TOOLS,
  AgentMessagePayload,
  EDITOR_EVENTS,
  ObserverStatus,
  RenameFileToolArgs,
  ToolCallbacks,
  uuid,
} from '../../../utils';
import { Schemas } from './schemas';
export class RenameFileTool {
  tool: FunctionTool<RenameFileToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.renameFile]) {
    this.tool = tool({
      execute: async (args: RenameFileToolArgs) => {
        const observer = EditorObserver.getInstance();
        const event: Omit<AgentMessagePayload<'renameFile'>, 'type'> = {
          id: uuid(4),
          args: { file: args.file, newName: args.newName },
          status: ObserverStatus.pending,
        };
        console.log('Renamin file', args);
        observer.emit(EDITOR_EVENTS.renameFile, event);
        event.status = ObserverStatus.done;

        await cb(args).catch((err) => {
          event.error = err.message;
          event.status = ObserverStatus.error;
        });

        observer.emit(EDITOR_EVENTS.renameFile, event);
        return {
          success: event.status === ObserverStatus.done,
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
