import { ToolCallLLM } from 'llamaindex';

import { PromptProps } from '../utils';
import { chat } from './models';
import { CHAT_PROMPT } from './prompts';

export class Chat {
  private llm: ToolCallLLM;

  constructor() {
    this.llm = chat;
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
