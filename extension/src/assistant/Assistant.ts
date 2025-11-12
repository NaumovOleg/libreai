import { HumanMessage, MessageStructure, SystemMessage } from '@langchain/core/messages';
import { SuggestionPromptParams } from '@utils';

import { LLMFactory } from './LLMFactroy';
import { CODE_COMPLETION_PROMPT, DOCUMENT, EXPLAIN } from './prompts';

type Documentpayload = { code: string; language: string };
type ExplainPayload = { language: string; selection: string; content: string };

export class Assistant {
  LLMFactory = new LLMFactory();

  get model() {
    return this.LLMFactory.chat;
  }

  get autocompleteModel() {
    return this.LLMFactory.autocomplete;
  }

  document(data: Documentpayload, stream: true): AsyncGenerator<string>;

  document(data: Documentpayload, stream?: false): Promise<string>;

  document(data: Documentpayload, stream = false) {
    if (stream) {
      return this.invokeStream(DOCUMENT(data));
    }
    return this.invoke(DOCUMENT(data));
  }

  explain(data: ExplainPayload, stream?: true): AsyncGenerator<string>;

  explain(data: ExplainPayload, stream: false): Promise<string>;

  explain(data: { language: string; selection: string; content: string }, stream = true) {
    const messages = EXPLAIN(data);
    if (stream) {
      return this.invokeStream(messages);
    }
    return this.invoke(messages);
  }

  async autocomplete(data: SuggestionPromptParams) {
    const messages = CODE_COMPLETION_PROMPT(data);
    const response = await this.autocompleteModel.invoke(messages);
    return (response.content as string)
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/, '')
      .trim();
  }

  async invoke(messages: (SystemMessage<MessageStructure> | HumanMessage<MessageStructure>)[]) {
    const response = await this.model.invoke(messages);
    const content = response.content as string;
    return content
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/, '')
      .trim();
  }

  async *invokeStream(
    messages: (SystemMessage<MessageStructure> | HumanMessage<MessageStructure>)[],
  ) {
    const response = await this.model.stream(messages);
    for await (const chunk of response) {
      yield chunk.content;
    }
  }
}
