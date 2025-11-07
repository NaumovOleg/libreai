import { AGENT_TOOLS, SemanticSearchToolArgs, ToolCallbacks, parseEmbeddings } from '@utils';
import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { Schemas } from './schemas';

export class SemanticSearch {
  tool: FunctionTool<SemanticSearchToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.semanticSearch]) {
    this.tool = tool({
      execute: async (args: SemanticSearchToolArgs) => {
        console.log('Searching embedings', args);

        const embeddings = await cb(args);

        console.log('EMBEDDINGS', embeddings);

        return {
          success: true,
          toolName: AGENT_TOOLS.semanticSearch,
          content: parseEmbeddings(embeddings),
        };
      },

      name: AGENT_TOOLS.semanticSearch,
      description: 'Search workspace embeddings by semantic criteria.',
      parameters: Schemas[AGENT_TOOLS.semanticSearch],
    });
  }
}
