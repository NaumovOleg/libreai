import { Runnable } from '@langchain/core/runnables';
import { Observer } from '@observer';
import * as z from 'zod';

import { emitErorr, MessagesState } from '../helper';
import { LLMFactory } from '../LLMFactroy';
import { ANALYZER_SYSTEM_PROMPT } from '../prompts';
import { read, semantic } from '../tools';

export class Analizer {
  model: Runnable;
  observer = Observer.getInstance();

  constructor() {
    const model = new LLMFactory().agent;
    this.model = model.bindTools([read, semantic]);
  }

  async exec(state: z.infer<typeof MessagesState>) {
    try {
      const data = [ANALYZER_SYSTEM_PROMPT, ...state.analizerMessages];
      const message = await this.model.invoke(data);

      return {
        ...state,
        response: message,
        analizerMessages: [...state.analizerMessages, message],
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      emitErorr(state, { error: err.name, type: 'analizer' });
      throw new Error(err);
    }
  }
}
