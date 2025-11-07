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
      description: `Performs semantic search across workspace embeddings to retrieve the most relevant code snippets or documentation.
      
### ⚙️ Embedding Retrieval Rules
  - You may call this **once initially** to gather relevant context.
  - If the context is clearly insufficient, you may fetch **one additional time** with a refined query.
  - In extreme cases, you may perform **a third and final fetch** — never more than ***3*** total.
  - Use concise, meaningful queries describing the intent or concept you need to find.
  - Do **not** repeat identical or near-identical queries.
  - Do **not** perform multiple searches for the same file.
  - NEVER repeat the same "semanticSearch" query, and never fetch embeddings for the same file multiple times.
`,
      parameters: Schemas[AGENT_TOOLS.semanticSearch],
    });
  }
}
