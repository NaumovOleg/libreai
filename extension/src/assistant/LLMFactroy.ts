import { AiConfigT, Conf } from '@utils';

import { LLM_CONSTRUCTORS, Model } from './helper';

export class LLMFactory {
  get agent() {
    return this.constryctModel(Conf.agentConfig);
  }

  get chat() {
    return this.constryctModel({ ...Conf.chatConfig, streaming: true });
  }

  get autocomplete() {
    return this.constryctModel(Conf.autoCompleteConfig);
  }

  constryctModel(config: AiConfigT & { streaming?: boolean }): Model {
    return new LLM_CONSTRUCTORS[config.provider]({
      apiKey: config.apiKey,
      model: config.model,
      temperature: config.temperature ?? 0,
      streaming: !!config.streaming,
    });
  }
}
