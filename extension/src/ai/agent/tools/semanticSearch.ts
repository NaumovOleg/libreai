import { AGENT_TOOLS, SemanticSearchToolArgs, ToolCallbacks } from '@utils';
import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { Schemas } from './schemas';

export class SemanticSearch {
  tool: FunctionTool<SemanticSearchToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.semanticSearch]) {
    this.tool = tool({
      execute: async (args: SemanticSearchToolArgs) => {
        console.log('Searching embedings', args);

        const response = await cb(args);

        const data = response?.map((e) => ({
          file: e.path,
          content: e.text,
        }));

        console.log('EMBEDDINGS', data);

        return {
          success: true,
          name: AGENT_TOOLS.semanticSearch,
          content: data,
        };
      },

      name: AGENT_TOOLS.semanticSearch,
      description: 'Search workspace embeddings by semantic criteria.',
      parameters: Schemas[AGENT_TOOLS.semanticSearch],
    });
  }
}
