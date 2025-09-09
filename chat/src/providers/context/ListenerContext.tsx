import { createContext } from 'react';
import { ListenerContextType } from '@utils';

export const ListenerContext = createContext<ListenerContextType | undefined>(undefined);
