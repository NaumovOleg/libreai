import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { EditorObserver } from '../../../observer';
import { AGENT_TOOLS, EDITOR_EVENTS, ReadFileToolArgs, ToolCallbacks } from '../../../utils';
import { Schemas } from './schemas';
export class ReadFileTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.readFile], observer: EditorObserver) {
    this.tool = tool(
      async (args: ReadFileToolArgs) => {
        console.log('Reading file from disk:', args, cb);
        observer.emit(EDITOR_EVENTS.readFile, { status: 'pending', args: args.file });
        let status = 'success';
        const content = await cb(args.file).catch(() => (status = 'error'));

        const result = { ...args, content, status, tool: AGENT_TOOLS.readFile };
        console.log('Reading file response :', args.file, content);
        observer.emit(EDITOR_EVENTS.readFile, { status: 'done', args: args.file });
        return JSON.stringify(result);
      },
      {
        name: AGENT_TOOLS.readFile,
        description: `Read the full content of a file.`,
        schema: Schemas[AGENT_TOOLS.readFile],
      },
    );
  }
}
