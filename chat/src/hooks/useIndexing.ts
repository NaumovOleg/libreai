import { IndexingContext } from '@providers';
import { IndexingContextType } from '@utils';
import { useContext } from 'react';

export const useIndexing = (): IndexingContextType => {
  const context = useContext(IndexingContext);
  if (context === undefined) {
    throw new Error('Indexing error context');
  }
  return context;
};
