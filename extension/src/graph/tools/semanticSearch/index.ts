import { tool } from '@langchain/core/tools';
import { SemanticSearchToolArgs, parseEmbeddings } from '@utils';
import { meta, schema } from './meta';
import { processor } from './processor';

export const semantic = tool<typeof schema, SemanticSearchToolArgs>(async (args, tool) => {
  console.log('-------------', meta.name, args, tool.toolCall);
  try {
    const embeddings = await processor(args);

    console.log(embeddings);

    return parseEmbeddings(embeddings);
  } catch (err: any) {
    return err.message;
  }
}, meta);
