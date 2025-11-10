import { Runnable } from '@langchain/core/runnables';
import * as z from 'zod';

import { MessagesState } from '../helper';
import { LLMFactory } from '../LLMFactroy';
import { SYSTEM_EDITOR_PROMPT } from '../prompts';
import { read, semantic } from '../tools';

export class Editor {
  model: Runnable;

  constructor() {
    const model = new LLMFactory().agent;
    this.model = model.bindTools([read, semantic]);
  }

  async exec(state: z.infer<typeof MessagesState>) {
    console.log(' EXECC EDITOR', state, [SYSTEM_EDITOR_PROMPT, ...state.editorMessages]);
    const message = await this.model.invoke([SYSTEM_EDITOR_PROMPT, ...state.editorMessages]);
    console.log('EDITOR CALL', { state, message });

    return { ...state, editorMessages: [...state.editorMessages, message] };
  }
}
