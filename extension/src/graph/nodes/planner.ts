import { Runnable } from '@langchain/core/runnables';
import * as z from 'zod';

import { MessagesState } from '../helper';
import { LLMFactory } from '../LLMFactroy';
import { PLANNER_AGENT_SYSTEM_PROMPT } from '../prompts';
import { read, semantic } from '../tools';

export class Planner {
  model: Runnable;

  constructor() {
    const model = new LLMFactory().agent;
    this.model = model.bindTools([read, semantic]);
  }

  async exec(state: z.infer<typeof MessagesState>) {
    const message = await this.model.invoke([
      PLANNER_AGENT_SYSTEM_PROMPT,
      ...state.plannerMessages,
    ]);

    return { ...state, plannerMessages: [...state.plannerMessages, message] };
  }
}
