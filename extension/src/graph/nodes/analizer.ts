import { Runnable } from '@langchain/core/runnables';
import { Observer } from '@observer';
import { AgentMessagePayload } from '@utils';
import * as vscode from 'vscode';
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
    try {
      const data = [ANALYZER_SYSTEM_PROMPT, ...state.analizerMessages];
      const message = await this.model.invoke(data);

      console.log('ANALIZER MESSAGE', message);

      return {
        ...state,
        response: message,
        analizerMessages: [...state.analizerMessages, message],
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const observer = Observer.getInstance();

      const event: AgentMessagePayload<'analizing'> = {
        id: state.analizerId,
        status: 'error',
        args: 'Analizing',
        type: 'analizing',
        error: err.message,
      };
      event.error = err.message;
      vscode.window.showErrorMessage(err.message);
      observer.emit('agent', event);
    }
  }
}
