import { LLMFactory } from '@llm';

import { PromptProps } from '../utils';
import { CHAT_PROMPT } from './prompts';

export class Chat {
  LLMFactory = new LLMFactory();

  get llm() {
    return this.LLMFactory.chat;
  }

  async chat(data: PromptProps) {
    const messages = CHAT_PROMPT(data);
    const response = await this.llm.chat({ messages });
    return JSON.parse(response.message.content as string);
  }

  async *chatStream(data: PromptProps) {
    const messages = CHAT_PROMPT(data);
    const response = await this.llm.chat({ messages, stream: true });
    for await (const chunk of response) {
      yield chunk.delta;
    }
  }
}
