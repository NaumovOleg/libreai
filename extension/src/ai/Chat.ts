import { PromptProps } from '../utils';
import { ModelFactory } from './models';
import { CHAT_PROMPT } from './prompts';

export class Chat {
  modelFactory = new ModelFactory();

  get llm() {
    return this.modelFactory.chat;
  }

  async chat(data: PromptProps) {
    const messages = CHAT_PROMPT(data);
    const response = await this.llm.chat({ messages });
    return JSON.parse(response.message.content as string);
  }

  async *chatStream(data: PromptProps) {
    const messages = CHAT_PROMPT(data);
    console.log({ messages, stream: true });
    const response = await this.llm.chat({ messages, stream: true });
    for await (const chunk of response) {
      yield chunk.delta;
    }
  }
}
