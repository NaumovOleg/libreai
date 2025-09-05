import { ConfigContext } from '@providers';
import { ConfigContextType } from '@utils';
import { useContext } from 'react';

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('Config error context');
  }
  return context;
};
