import { Runnable } from '@langchain/core/runnables';
import { Observer } from '@observer';
import { AgentMessagePayload } from '@utils';
import * as vscode from 'vscode';
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
    try {
      const message = await this.model.invoke([
        PLANNER_AGENT_SYSTEM_PROMPT,
        ...state.plannerMessages,
      ]);

      console.log('PLANNER MESSAGE', message);

      return { ...state, response: message, plannerMessages: [...state.plannerMessages, message] };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const observer = Observer.getInstance();

      const event: AgentMessagePayload<'planning'> = {
        id: state.plannerId,
        status: 'error',
        args: 'Planning',
        type: 'planning',
        error: err.message,
      };
      event.error = err.message;
      vscode.window.showErrorMessage(err.message);
      observer.emit('agent', event);
    }
  }
}
