import { tool } from '@langchain/core/tools';
import { parseEmbeddings, SemanticSearchToolArgs } from '@utils';

import { meta, schema } from './meta';
import { processor } from './processor';

export const semantic = tool<typeof schema, SemanticSearchToolArgs>(async (args, tool) => {
  console.log('-------------', meta.name, args, tool.toolCall);
  try {
    const embeddings = await processor(args);

    console.log(embeddings);

    return parseEmbeddings(embeddings);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return `${err.name}. ${err.message}`;
  }
}, meta);
