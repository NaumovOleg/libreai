import { ListenerContext } from '@providers';
import { ListenerContextType } from '@utils';
import { useContext } from 'react';

export const useListener = (): ListenerContextType => {
  const context = useContext(ListenerContext);
  if (context === undefined) {
    throw new Error('ListenerContext error context');
  }
  return context;
};
