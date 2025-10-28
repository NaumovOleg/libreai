import { getWorkspacesUrl, SearchEmbeddingsToolArgs } from '@utils';

import { VectorStorage } from '../database';

export const retrieveEmbeddingsCb = async (search: SearchEmbeddingsToolArgs) => {
  const db = VectorStorage.getInstance();
  if (!getWorkspacesUrl().length) return [];
  return db.searchKNN(
    search.criteria,
    { workspaces: getWorkspacesUrl() },
    Math.max(search.limit, 30),
  );
};
