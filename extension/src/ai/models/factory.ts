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
    this.buildAgentModel(Conf.agentConfig.provider);
  }

  buildAgentModel(provider: 'openai' | 'ollama' | 'deepseek' | 'openrouter') {
    const config = Conf.chatConfig;
    const constructor = constructors[provider];

    this.agent = constructor({
      apiKey: config.apiKey,
      model: config.model,
      supportToolCall: true,

      additionalChatOptions: {
        tool_choice: 'auto',
      },
    });
  }
}
