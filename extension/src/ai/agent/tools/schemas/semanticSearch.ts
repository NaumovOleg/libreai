import { z } from 'zod';

export const SemanticSearchSchema = z.object({
  search: z.string().describe('A short semantic search to vector storage. '),
  limit: z
    .number()
    .optional()
    .default(5)
    .describe('Maximum number of nearest neighbor vectors to retrieve from the embedding index.'),
});
