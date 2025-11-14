/* eslint-disable max-len */
import { AGENT_TOOLS } from '@utils';
import { z } from 'zod';

export const schema = z.object({
  search: z.string().describe('A short semantic search to vector storage. '),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe('Maximum number of nearest neighbor vectors to retrieve from the embedding index.'),
});

export const meta = {
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
  schema,
};
