import { createContext } from 'react';
import { ConfigContextType } from '@utils';

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);
