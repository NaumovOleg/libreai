import { getWorkspaceName, SearchEmbeddingsToolArgs } from '@utils';

import { VectorStorage } from '../database';

export const retrieveEmbeddingsCb = async (search: SearchEmbeddingsToolArgs) => {
  const db = VectorStorage.getInstance();
  return db.searchKNN(search.criteria, { workspace: getWorkspaceName() }, search.limit);
};
