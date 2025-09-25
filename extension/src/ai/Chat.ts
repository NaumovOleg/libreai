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
    console.log('chat=====================');
    const messages = CHAT_PROMPT(data);
    const response = await this.llm.chat({ messages });
    return JSON.parse(response.message.content as string);
  }

  async *chatStream(data: PromptProps) {
    console.log('chatStream=====================');
    const messages = CHAT_PROMPT(data);
    const response = await this.llm.chat({ messages, stream: true });
    for await (const chunk of response) {
      console.log('+++++++++++++++', chunk.delta);
      yield chunk.delta;
    }
  }
}
