import { Runnable } from '@langchain/core/runnables';
import * as z from 'zod';

import { MessagesState } from '../helper';
import { LLMFactory } from '../LLMFactroy';
import { ANALYZER_SYSTEM_PROMPT } from '../prompts';
import { read, semantic } from '../tools';

export class Analizer {
  model: Runnable;

  constructor() {
    const model = new LLMFactory().agent;
    this.model = model.bindTools([read, semantic]);
  }

  async exec(state: z.infer<typeof MessagesState>) {
    const data = [ANALYZER_SYSTEM_PROMPT, ...state.analizerMessages];
    const message = await this.model.invoke(data);
    console.log('ANALIZER CALL', { state, message, data });

    return { ...state, analizerMessages: [...state.analizerMessages, message] };
  }
}
