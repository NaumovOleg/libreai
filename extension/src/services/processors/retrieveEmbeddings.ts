import { getActiveWorkspaces, SearchEmbeddingsToolArgs } from '@utils';

import { VectorStorage } from '../database';

export const retrieveEmbeddingsCb = async (args: SearchEmbeddingsToolArgs) => {
  const db = VectorStorage.getInstance();

  const workspaces = getActiveWorkspaces();
  if (!workspaces?.length) return [];

  return db.searchKNN(args.search, workspaces, Math.min(args.limit, 30));
};
