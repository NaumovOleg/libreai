import { z } from 'zod';

export const SearchEmbeddingsSchema = z.object({
  search: z
    .string()
    .describe(
      'A natural-language semantic query describing what information to retrieve from code embeddings. The text will be converted into a vector using the embedder and matched semantically to the codebase.',
    ),
  limit: z
    .number()
    .describe('Maximum number of nearest neighbor vectors to retrieve from the embedding index.'),
});
