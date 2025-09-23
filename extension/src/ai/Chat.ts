import { Runnable } from '@langchain/core/runnables';

import { PromptProps } from '../utils';
import { chat } from './models';
import { CHAT_PROMPT } from './prompts';

export class Chat {
  private chain: Runnable;

  constructor() {
    this.chain = CHAT_PROMPT.pipe(chat);
  }

  chat(data: PromptProps) {
    return this.chain.invoke(data);
  }

  async *chatStream(data: PromptProps) {
    const stream = await this.chain.stream(data);

    for await (const chunk of stream) {
      yield chunk.content;
    }
  }
}
