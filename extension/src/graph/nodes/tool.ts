/* eslint-disable @typescript-eslint/no-explicit-any */
import { AIMessage, BaseMessage, ToolMessage } from '@langchain/core/messages';
import { Observer } from '@observer';
import {
  AgentMessagePayload,
  CommandToolArgs,
  CreateFileToolArgs,
  DeleteFileToolArgs,
  ReadFileToolArgs,
  RenameFileToolArgs,
} from '@utils';
import * as z from 'zod';

import { MessagesState } from '../helper';
import { command, create, edit, read, remove, rename, semantic } from '../tools';

const TOOLS = {
  editFile: edit,
  command,
  renameFile: rename,
  deleteFile: remove,
  createFile: create,
  readFile: read,
  semanticSearch: semantic,
};

type State = z.infer<typeof MessagesState>;
type ToolName = keyof typeof TOOLS;

type ToolCallMap = {
  command: CommandToolArgs;
  renameFile: RenameFileToolArgs;
  deleteFile: DeleteFileToolArgs;
  createFile: CreateFileToolArgs;
  readFile: ReadFileToolArgs;
};

export type ToolTypeS = keyof ToolCallMap;

export type ToolCall<T extends ToolTypeS = ToolTypeS> = {
  id: string;
  name: T;
  args: ToolCallMap[T];
};

export class ToolNode {
  async analizer(state: z.infer<typeof MessagesState>) {
    const message = state.analizerMessages.at(-1);
    if (!message) {
      return { ...state, plannerMessages: [] };
    }
    const result = await this.runTools(message);
    return { ...state, analizerMessages: [...state.analizerMessages, ...result] };
  }

  async planner(state: z.infer<typeof MessagesState>) {
    const message = state.plannerMessages.at(-1);
    if (!message) {
      return { ...state, plannerMessages: [] };
    }
    const result = await this.runTools(message, 'planner');

    return { ...state, plannerMessages: [...state.plannerMessages, ...result] };
  }

  async editor(state: State) {
    const message = state.editorMessages.at(-1);
    if (!message) {
      return { ...state, editorMessages: [] };
    }
    const result = await this.runTools(message, 'editor');

    return { ...state, editorMessages: [...state.editorMessages, ...result] };
  }

  async runTools(message: BaseMessage) {
    const result: ToolMessage[] = [];
    if (!AIMessage.isInstance(message)) {
      return [];
    }
    for (const toolCall of message.tool_calls ?? []) {
      const name = toolCall.name as ToolName;

      const tool: any = TOOLS[name];
      if (!tool) continue;

      await this.emit('pre', toolCall as ToolCall);
      const observation = await tool.invoke(toolCall);
      await this.emit('post', toolCall as ToolCall, observation);
      result.push(observation);
    }

    return result;
  }

  async emit(position: 'pre', toolCall: ToolCall): Promise<void>;

  async emit(position: 'post', toolCall: ToolCall, response: any): Promise<void>;

  async emit(position: 'pre' | 'post', toolCall: ToolCall, response?: any) {
    if (['semanticSearch', 'editFile'].includes(toolCall.name)) return;
    const observer = Observer.getInstance();
    const event: AgentMessagePayload<typeof toolCall.name> = {
      id: toolCall.id,
      args: toolCall.args,
      status: 'pending',
      type: toolCall.name,
    };

    if (position === 'pre') {
      return observer.emit('agent', event as any);
    }

    event.status = 'done';

    if (response.error) {
      event.status = 'error';
      event.error = response.error;
    }

    if (toolCall.name === 'command') {
      (event as AgentMessagePayload<'command'>).args.state =
        response === 'DECLINED_COMMAND_MESSAGE' ? 'declined' : 'confirmed';
    }
    return observer.emit('agent', event as any);
  }
}
