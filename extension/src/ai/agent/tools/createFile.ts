import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { EditorObserver } from '../../../observer';
import { AGENT_TOOLS, CreateToolArgs, EDITOR_EVENTS, ToolCallbacks, uuid } from '../../../utils';
import { Schemas } from './schemas';

export class CreateFileTool {
  tool: FunctionTool<CreateToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.createFile]) {
    this.tool = tool({
      execute: async (args: CreateToolArgs) => {
        const observer = EditorObserver.getInstance();
        const event = { id: uuid(4), args: args.file };
        console.log('Creating', args);
        observer.emit(EDITOR_EVENTS.createFile, { status: 'pending', ...event });
        let status = 'success';
        await cb(args).catch(() => (status = 'error'));
        observer.emit(EDITOR_EVENTS.createFile, { status: 'done', ...event });

        return JSON.stringify({ status, tool: 'createFile', taskId: args.taskId });
      },
      name: AGENT_TOOLS.createFile,
      description: 'Creates a new file with provided content.',
      parameters: Schemas[AGENT_TOOLS.createFile],
    });
  }
}
