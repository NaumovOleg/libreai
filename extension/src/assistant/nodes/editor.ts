import { Runnable } from '@langchain/core/runnables';
import * as z from 'zod';

import { MessagesState } from '../helper';
import { LLMFactory } from '../LLMFactroy';
import { SYSTEM_EDITOR_PROMPT } from '../prompts';
import { command, create, edit, read, remove, rename, semantic } from '../tools';

export class Editor {
  model: Runnable;

  constructor() {
    const model = new LLMFactory().agent;
    this.model = model.bindTools([read, semantic, edit, remove, create, command, rename]);
  }

  async exec(state: z.infer<typeof MessagesState>) {
    const message = await this.model.invoke([SYSTEM_EDITOR_PROMPT, ...state.editorMessages]);

    return { ...state, response: message, editorMessages: [...state.editorMessages, message] };
  }
}
