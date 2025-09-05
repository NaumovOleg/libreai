import { AiConfigT, CONFIG_PARAGRAPH } from './types';

export type ConfigContextType = {
  [CONFIG_PARAGRAPH.chatConfig]: AiConfigT;
  [CONFIG_PARAGRAPH.autoCompleteConfig]: AiConfigT;
  setConfig: (type: CONFIG_PARAGRAPH, conf: Partial<AiConfigT>) => void;
  applyChanges: (type: CONFIG_PARAGRAPH) => void;
};
