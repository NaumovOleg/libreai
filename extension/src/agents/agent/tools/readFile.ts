import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { AGENT_TOOLS, ReadFileToolArgs, ToolCallbacks } from '../../../utils';
import { Schemas } from './schemas';

export class ReadFileTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.readFile]) {
    this.tool = tool(
      async (args: ReadFileToolArgs) => {
        console.log('Reading file from disk:', args);
        let status = 'success';
        const content = await cb(args.file).catch(() => (status = 'error'));

        const result = { ...args, content, status, tool: AGENT_TOOLS.readFile };
        console.log('Reading file response :', args.file, content);

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
