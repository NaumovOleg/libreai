import { AIMessage, ToolMessage } from '@langchain/core/messages';
import * as z from 'zod';

import { MessagesState } from '../helper';
import { command } from '../tools/command';
import { read } from '../tools/readFile';
import { semantic } from '../tools/semanticSearch';

const TOOLS = { command, semanticSearch: semantic, readFile: read };

type AnalizerTools = 'semanticSearch' | 'readFile';

export class ToolNode {
  async analizer(state: z.infer<typeof MessagesState>) {
    const lastMessage = state.analizerMessages.at(-1);

    if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
      return { messages: [] };
    }
    const result: ToolMessage[] = [];
    for (const toolCall of lastMessage.tool_calls ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tool: any = TOOLS[toolCall.name as AnalizerTools];
      if (!tool) continue;

      const observation = await tool.invoke(toolCall);
      console.log('observation', observation);
      result.push(observation);
    }

    return { ...state, analizerMessages: [...state.analizerMessages, ...result] };
  }

  async planner(state: z.infer<typeof MessagesState>) {
    const lastMessage = state.plannerMessages.at(-1);

    if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
      return { messages: [] };
    }
    const result: ToolMessage[] = [];
    for (const toolCall of lastMessage.tool_calls ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tool: any = TOOLS[toolCall.name as AnalizerTools];
      if (!tool) continue;

      const observation = await tool.invoke(toolCall);
      console.log('observation', observation);
      result.push(observation);
    }

    return { ...state, plannerMessages: [...state.plannerMessages, ...result] };
  }
}
