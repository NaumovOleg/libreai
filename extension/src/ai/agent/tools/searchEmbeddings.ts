import { AGENT_TOOLS, SearchEmbeddingsToolArgs, ToolCallbacks } from '@utils';
import { FunctionTool, JSONValue, tool } from 'llamaindex';

import { Schemas } from './schemas';

export class SearchEmbeddings {
  tool: FunctionTool<SearchEmbeddingsToolArgs, JSONValue | Promise<JSONValue>, object>;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.searchEmbeddings]) {
    this.tool = tool({
      execute: async (args: SearchEmbeddingsToolArgs) => {
        console.log('Searching embedings', args);

        const response = await cb(args);

        const data = response?.map((e) => ({
          file: e.path,
          content: e.text,
        }));

        console.log('EMBEDDINGS DATA------------', data);

        return data;
      },

      name: AGENT_TOOLS.searchEmbeddings,
      description: 'Search workspace embeddings by semantic criteria.',
      parameters: Schemas[AGENT_TOOLS.searchEmbeddings],
    });
  }
}
