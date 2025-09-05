import { createContext } from 'react';
import { ChatContextType } from '@utils';

export const ChatContext = createContext<ChatContextType | undefined>(undefined);
