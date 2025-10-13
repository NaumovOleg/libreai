import { LLMFactory } from '@llm';
import { PromptMessages } from '@utils';

import { DOCUMENT } from './prompts';

export class HelperAi {
  LLMFactory = new LLMFactory();

  get llm() {
    return this.LLMFactory.chat;
  }

  document(data: { code: string; language: string }, stream = false) {
    if (stream) {
      return this.chatStream(DOCUMENT(data));
    }
    return this.chat(DOCUMENT(data));
  }

  async chat(messages: PromptMessages) {
    const response = await this.llm.chat({ messages });
    const content = response.message.content as string;
    return content
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/, '')
      .trim();
  }

  async *chatStream(messages: PromptMessages) {
    const response = await this.llm.chat({ messages, stream: true });
    for await (const chunk of response) {
      yield chunk.delta;
    }
  }
}
