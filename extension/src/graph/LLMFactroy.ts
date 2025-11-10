import { AiConfigT } from '@global/types';
import { Conf } from '@utils';
import { LLM_CONSTRUCTORS, Model } from './helper';

export class LLMFactory {
  get agent() {
    return this.constryctModel(Conf.agentConfig);
  }

  get planner() {
    return this.constryctModel(Conf.agentConfig);
  }

  get chat() {
    return this.constryctModel(Conf.chatConfig);
  }

  get autocomplete() {
    return this.constryctModel(Conf.autoCompleteConfig);
  }

  constryctModel(config: AiConfigT): Model {
    console.log({
      apiKey: config.apiKey,
      model: config.model,
      temperature: config.temperature ?? 0,
      privider: config.provider,
    });
    return new LLM_CONSTRUCTORS[config.provider]({
      apiKey: config.apiKey,
      model: config.model,
      temperature: config.temperature ?? 0,
    });
  }
}
