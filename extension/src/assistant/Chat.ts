import { PromptProps } from '@utils';
import { createAgent, ReactAgent } from 'langchain';

import { LLMFactory } from './LLMFactroy';
import { CHAT_PROMPT } from './prompts';
import { read, semantic } from './tools';
export class Chat {
  agent: ReactAgent;

  constructor() {
    const model = new LLMFactory().chat;

    this.agent = createAgent({ model, tools: [read, semantic] });
  }

  async chat(data: PromptProps) {
    return this.agent.invoke({ messages: CHAT_PROMPT(data) });
  }

  async *chatStream(data: PromptProps) {
    const stream = await this.agent.stream(
      { messages: CHAT_PROMPT(data) },
      { streamMode: 'messages' },
    );

    for await (const chunk of stream) {
      const [message, metadata] = chunk;
      if (metadata.langgraph_node === 'model_request' && message.content) {
        yield message.content;
      }
    }
  }
}
