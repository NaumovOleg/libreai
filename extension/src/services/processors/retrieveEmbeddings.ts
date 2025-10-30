import { getActiveWorkspaces, SearchEmbeddingsToolArgs } from '@utils';

import { Db } from '@db';

export const retrieveEmbeddingsCb = async (args: SearchEmbeddingsToolArgs) => {
  const db = Db.getInstance();

  const workspaces = getActiveWorkspaces();
  if (!workspaces?.length) return [];

  return db.searchEmbeddings(args.search, workspaces, Math.min(args.limit, 30));
};
