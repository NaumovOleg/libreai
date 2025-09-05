import { ChatConfig, CONFIG_PARAGRAPH } from './types';

export type ConfigContextType = {
  [CONFIG_PARAGRAPH.chatConfig]: ChatConfig;
  setChatConfig: (conf: Partial<ChatConfig>) => void;
  applyChanges: () => void;
};
