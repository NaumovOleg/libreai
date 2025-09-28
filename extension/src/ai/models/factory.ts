import { OpenAI, openai } from '@llamaindex/openai';

import { Conf } from '../../utils';

const constructors = {
  openai: openai,
  ollama: openai,
  deepseek: openai,
  openrouter: openai,
};
export class ModelFactory {
  agent!: OpenAI;

  constructor() {
    this.buildAgentModel(Conf.autoCompleteConfig.provider);
  }

  buildAgentModel(provider: 'openai' | 'ollama' | 'deepseek' | 'openrouter') {
    const config = Conf.chatConfig;
    const constructor = constructors[provider];

    console.log('+++++++++', {
      apiKey: config.apiKey,
      model: config.model,
    });

    this.agent = constructor({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
