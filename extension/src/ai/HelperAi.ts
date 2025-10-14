import { LLMFactory } from '@llm';
import { PromptMessages } from '@utils';

import { DOCUMENT, EXPLAIN } from './prompts';

type Documentpayload = { code: string; language: string };
type ExplainPayload = { language: string; selection: string; content: string };

export class HelperAi {
  LLMFactory = new LLMFactory();

  get llm() {
    return this.LLMFactory.chat;
  }

  document(data: Documentpayload, stream: true): AsyncGenerator<string>;

  document(data: Documentpayload, stream?: false): Promise<string>;

  document(data: Documentpayload, stream = false) {
    if (stream) {
      return this.chatStream(DOCUMENT(data));
    }
    return this.chat(DOCUMENT(data));
  }

  explain(data: ExplainPayload, stream?: true): AsyncGenerator<string>;

  explain(data: ExplainPayload, stream: false): Promise<string>;

  explain(data: { language: string; selection: string; content: string }, stream = true) {
    const prompt = EXPLAIN(data);
    if (stream) {
      return this.chatStream(prompt);
    }
    return this.chat(prompt);
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
