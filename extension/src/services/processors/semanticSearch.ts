import { getActiveWorkspaces, SemanticSearchToolArgs } from '@utils';

import { Db } from '@db';

export const semanticSearchCb = async (args: SemanticSearchToolArgs) => {
  const db = Db.getInstance();

  const workspaces = getActiveWorkspaces();
  if (!workspaces?.length) return [];

  return db.semanticSearch(args.search, workspaces, Math.min(args.limit, 30));
};
