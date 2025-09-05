import { ChatContext } from '@providers';
import { ChatContextType } from '@utils';
import { useContext } from 'react';

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('Chat error context');
  }
  return context;
};
