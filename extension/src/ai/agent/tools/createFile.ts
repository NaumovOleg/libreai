import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
import {
  AGENT_TOOLS,
  AgentMessagePayload,
  CreateToolArgs,
  EDITOR_EVENTS,
  ObserverStatus,
  ToolCallbacks,
  uuid,
} from '../../../utils';
import { Schemas } from './schemas';

export class CreateFileTool {
  tool: FunctionTool<CreateToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.createFile]) {
    this.tool = tool({
      execute: async (args: CreateToolArgs) => {
        const observer = EditorObserver.getInstance();
        const event: Omit<AgentMessagePayload<'createFile'>, 'type'> = {
          id: uuid(4),
          args: { file: args.file, content: args.content },
          status: ObserverStatus.pending,
        };
        console.log('Creating', args);
        observer.emit(EDITOR_EVENTS.createFile, event);
        event.status = ObserverStatus.done;
        await cb(args).catch((err) => {
          event.error = err.message;
          event.status = ObserverStatus.error;
        });

        observer.emit(EDITOR_EVENTS.createFile, event);

        return {
          success: (event.status = ObserverStatus.done),
          name: EDITOR_EVENTS.createFile,
          file: args.file,
        };
      },
      name: AGENT_TOOLS.createFile,
      description: 'Creates a new file with provided content.',
      parameters: Schemas[AGENT_TOOLS.createFile],
    });
  }
}
