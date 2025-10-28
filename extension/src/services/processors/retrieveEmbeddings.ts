import { getWorkspacesUrl, SearchEmbeddingsToolArgs } from '@utils';

import { VectorStorage } from '../database';

export const retrieveEmbeddingsCb = async (args: SearchEmbeddingsToolArgs) => {
  const db = VectorStorage.getInstance();

  if (!getWorkspacesUrl().length) return [];
  return db.searchKNN(args.search, { workspaces: getWorkspacesUrl() }, Math.min(args.limit, 30));
};
