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
  - Use this tool **only when you lack sufficient context** to proceed.
  - You may call it up to **2 times total per reasoning session** (STRICT LIMIT).
  - Use concise queries describing the context you are missing.
  - Do **not** repeat identical or near-identical queries.
  - Do **not** perform multiple searches for the same file.
  - NEVER repeat the same "semanticSearch" query, and never fetch embeddings for the same file multiple times.
`,
      parameters: Schemas[AGENT_TOOLS.semanticSearch],
    });
  }
}
