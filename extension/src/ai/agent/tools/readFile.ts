import { AGENT_TOOLS, AgentMessagePayload, ReadFileToolArgs, ToolCallbacks, uuid } from '@utils';
import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { Observer } from '../../../observer';
import { Schemas } from './schemas';
export class ReadFileTool {
  tool: FunctionTool<ReadFileToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.readFile]) {
    this.tool = tool({
      execute: async (args: ReadFileToolArgs) => {
        const observer = Observer.getInstance();
        try {
          console.log('Reading file from disk:', args.file);
          const event: AgentMessagePayload<'readFile'> = {
            status: 'pending',
            id: uuid(4),
            error: undefined,
            args: { file: args.file },
            type: 'readFile',
          };
          observer.emit('agent', event);
          event.status = 'done';

          const content = await cb(args.file).catch((err) => {
            event.error = err.message;
            event.status = 'error';
          });

          const result = {
            name: AGENT_TOOLS.readFile,
            file: args.file,
            content: content ?? '',
            success: event.status === 'done',
          };

          console.log('Reading file response :', args.file);
          observer.emit('agent', event);
          return result;
        } catch (err) {
          console.log(err);
          return JSON.stringify({ status: 'error' });
        }
      },

      name: AGENT_TOOLS.readFile,
      description: `Read the full content of a file.`,
      parameters: Schemas[AGENT_TOOLS.readFile],
    });
  }
}
