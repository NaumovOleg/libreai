import { LLMFactory } from '@llm';
import { SuggestionPromptParams } from '@utils';

import { INLINE_SUGGESTION_PROMPT } from './prompts';

export class Autocomplete {
  LLMFactory = new LLMFactory();

  get llm() {
    return this.LLMFactory.autocomplete;
  }

  async run(data: SuggestionPromptParams) {
    const prompt = INLINE_SUGGESTION_PROMPT(data);
    const response = await this.llm.complete({ prompt });
    return response.text
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/, '')
      .trim();
  }
}
