import { AIMessage } from '@langchain/core/messages';
import { END } from '@langchain/langgraph';
import { Observer } from '@observer';
import { AgentMessagePayload } from '@utils';
import * as z from 'zod';

import { makeEditorMessage, MessagesState, parseHumanMessage } from '../helper';
type inferMessageState = z.infer<typeof MessagesState>;

export class Flow {
  startAnalizer(state: inferMessageState) {
    console.log('START ANALIZER', state);
    const observer = Observer.getInstance();

    const event: AgentMessagePayload<'analizing'> = {
      id: state.analizerId,
      status: 'pending',
      args: 'Analizing',
      type: 'analizing',
    };
    observer.emit('agent', event);
    return state;
  }

  endAnalizer(state: inferMessageState) {
    console.log('END ANALIZER', state);
    const observer = Observer.getInstance();

    const event: AgentMessagePayload<'analizing'> = {
      id: state.analizerId,
      status: 'done',
      args: 'Analizing',
      type: 'analizing',
    };
    observer.emit('agent', event);
    return state;
  }

  startPlanner(state: inferMessageState) {
    const observer = Observer.getInstance();

    const event: AgentMessagePayload<'planning'> = {
      id: state.plannerId,
      status: 'pending',
      args: 'Planning',
      type: 'planning',
    };
    observer.emit('agent', event);
    return state;
  }

  endPlanner(state: inferMessageState) {
    const observer = Observer.getInstance();

    const event: AgentMessagePayload<'planning'> = {
      id: state.plannerId,
      status: 'done',
      args: 'Planning',
      type: 'planning',
    };
    observer.emit('agent', event);
    return state;
  }

  async analizerRouter(state: inferMessageState) {
    const lastMessage = state.analizerMessages.at(-1);
    console.log('ANALIZER ROUTER ', state, AIMessage.isInstance(lastMessage));

    if (lastMessage == null || !AIMessage.isInstance(lastMessage)) return END;

    if (lastMessage.tool_calls?.length) {
      return 'analizer_tools';
    }

    if ((lastMessage.content as string).includes('nextStep')) {
      state.plannerMessages = [parseHumanMessage(state.ctx)];
      return 'end_analizer';
    }

    return 'finish_analizer';
  }

  startEditor(state: inferMessageState) {
    try {
      if (!state.instructions.length) {
        const lastMessage = state.plannerMessages.at(-1);
        console.log('EDITOR START ROUTER ', state, AIMessage.isInstance(lastMessage));

        const instructions = JSON.parse(lastMessage?.content as string);
        state.instructions = instructions;
      }

      state.editorMessages = [makeEditorMessage(state)];
      state.intructionIndex = state.intructionIndex + 1;

      return state;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return state;
    }
  }

  async plannerRouter(state: inferMessageState) {
    const lastMessage = state.plannerMessages.at(-1);
    console.log('PLANNER ROUTER ', state, AIMessage.isInstance(lastMessage));

    if (AIMessage.isInstance(lastMessage) && lastMessage?.tool_calls?.length) {
      return 'planner_tools';
    }

    try {
      const instructions = JSON.parse(lastMessage?.content as string);

      console.log('=================dddddd', instructions, state);

      return 'end_planner';
    } catch (err) {
      console.log(err);
      return 'finish_planner';
    }
  }

  async editorRouter(state: inferMessageState) {
    const lastMessage = state.editorMessages.at(-1);
    console.log('EDITOR ROUTER ', state, AIMessage.isInstance(lastMessage));

    if (AIMessage.isInstance(lastMessage) && lastMessage?.tool_calls?.length) {
      return 'editor_tools';
    }

    if (state.intructionIndex + 1 < state.instructions.length) {
      console.log('========aaaaaaaa', state);
      return 'start_editor';
    }

    return END;
  }
}
