import { z } from 'zod';

export const SearchEmbeddingsSchema = z.object({
  criteria: z.string().describe('Semantic search query. Returns code embeddings.'),
  limit: z.number().describe('Embeddings limit.'),
});
