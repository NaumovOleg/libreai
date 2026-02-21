import { AIMessage } from '@langchain/core/messages';
import { END } from '@langchain/langgraph';
import { Observer } from '@observer';
import * as z from 'zod';

import { makeEditorMessage, MessagesState } from '../helper';
type inferMessageState = z.infer<typeof MessagesState>;

export class Flow {
  observer = Observer.getInstance();

  startPlanner(state: inferMessageState) {
    this.observer.emit('agent', {
      id: state.plannerId,
      status: 'pending',
      args: 'Planning',
      type: 'planning',
    });
    return state;
  }

  endPlanner(state: inferMessageState) {
    this.observer.emit('agent', {
      id: state.plannerId,
      status: 'done',
      args: 'Planning',
      type: 'planning',
    });
    return state;
  }

  startEditor(state: inferMessageState) {
    try {
      this.observer.emit('agent', {
        id: state.editorId,
        status: 'pending',
        args: 'Executing',
        type: 'executing',
      });
      if (!state.instructions.length) {
        const lastMessage = state.plannerMessages.at(-1);

        const instructions = JSON.parse(lastMessage?.content as string);
        state.instructions = instructions;
      }

      state.editorMessages = [makeEditorMessage(state)];
      state.intructionIndex = state.intructionIndex + 1;

      return state;
    } catch (_err) {
      return state;
    }
  }

  async plannerRouter(state: inferMessageState) {
    const lastMessage = state.plannerMessages.at(-1);

    if (AIMessage.isInstance(lastMessage) && lastMessage?.tool_calls?.length) {
      return 'planner_tools';
    }

    try {
      JSON.parse(lastMessage?.content as string);

      return 'end_planner';
    } catch (_err) {
      return 'finish_planner';
    }
  }

  async editorRouter(state: inferMessageState) {
    const lastMessage = state.editorMessages.at(-1);

    if (AIMessage.isInstance(lastMessage) && lastMessage?.tool_calls?.length) {
      return 'editor_tools';
    }

    if (state.intructionIndex < state.instructions.length) {
      return 'start_editor';
    }

    this.observer.emit('agent', {
      id: state.editorId,
      status: 'done',
      args: 'Executing',
      type: 'executing',
    });
    return END;
  }
}
