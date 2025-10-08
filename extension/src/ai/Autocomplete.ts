import { SuggestionPromptParams } from '../utils';
import { ModelFactory } from './models';
import { INLINE_SUGGESTION_PROMPT } from './prompts';

export class Autocomplete {
  modelFactory = new ModelFactory();

  get llm() {
    return this.modelFactory.autocomplete;
  }

  async run(data: SuggestionPromptParams) {
    console.log(data);
    const prompt = INLINE_SUGGESTION_PROMPT(data);
    const response = await this.llm.complete({ prompt });

    console.log('AUTOCOMPLETE response', response);

    return response.text
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/, '')
      .trim();
  }
}
