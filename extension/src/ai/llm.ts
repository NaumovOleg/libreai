import { deepseek } from '@llamaindex/deepseek';
import { ollama } from '@llamaindex/ollama';
import { openai } from '@llamaindex/openai';
import { LLM, ToolCallLLM } from 'llamaindex';

import { AiConfigT, AiProviders } from '../../../global.types';
import { Conf } from '../utils';

const constructors = {
  [AiProviders.openai]: openai,
  [AiProviders.ollama]: ollama,
  [AiProviders.deepseek]: deepseek,
  [AiProviders.openrouter]: openai,
};

export class LLMFactory {
  get agent(): ToolCallLLM {
    return this.constryctModel(Conf.agentConfig, true);
  }

  get planner(): ToolCallLLM {
    return this.constryctModel(Conf.agentConfig);
  }

  get chat(): LLM {
    return this.constryctModel(Conf.chatConfig);
  }

  get autocomplete(): LLM {
    return this.constryctModel(Conf.autoCompleteConfig);
  }

  constryctModel(config: AiConfigT, agent = false) {
    const settings = { apiKey: config.apiKey, model: config.model } as any;
    const temperature = config.temperature ?? 0;
    const provider = config.provider;
    if ([AiProviders.openai, AiProviders.openrouter].includes(provider)) {
      settings.temperature = 1;
      settings.baseURL = config.endpoint;
      if (agent) {
        settings.supportToolCall = true;
        settings.additionalChatOptions = { tool_choice: 'auto' };
      }
    }
    if (provider === AiProviders.deepseek) {
      Object.assign(settings, { temperature });
    }
    if (provider === AiProviders.ollama) {
      Object.assign(settings, {
        config: { host: Conf.agentConfig.endpoint },
        options: { temperature },
      });
    }
    return constructors[provider](settings as any);
  }
}
