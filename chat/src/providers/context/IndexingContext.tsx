import { createContext } from 'react';
import { IndexingContextType } from '@utils';

export const IndexingContext = createContext<IndexingContextType | undefined>(undefined);
