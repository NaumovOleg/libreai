import { AIMessage } from '@langchain/core/messages';
import { type CompiledStateGraph, END, START, StateGraph } from '@langchain/langgraph';
import { PlannerQuery } from '@utils';
import * as z from 'zod';

import { makeEditorMessage, MessagesState, parseHumanMessage } from './helper';
import { Analizer, Editor, Planner, ToolNode } from './nodes';

type inferMessageState = z.infer<typeof MessagesState>;

export class GraphWorkflow {
  analizer: Analizer;
  planner: Planner;
  editor: Editor;
  tools: ToolNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: CompiledStateGraph<any, any, any, any>;

  async analizerRouter(state: inferMessageState) {
    const lastMessage = state.analizerMessages.at(-1);
    console.log('ANALIZER ROUTER ', state, AIMessage.isInstance(lastMessage));

    if (lastMessage == null || !AIMessage.isInstance(lastMessage)) return END;

    if (lastMessage.tool_calls?.length) {
      return 'analizer_tools';
    }

    if ((lastMessage.content as string).includes('nextStep')) {
      state.plannerMessages = [parseHumanMessage(state.ctx)];
      return 'planner';
    }

    return END;
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

      return 'start_editor';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return END;
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

  constructor() {
    this.analizer = new Analizer();
    this.planner = new Planner();
    this.editor = new Editor();
    this.tools = new ToolNode();
    const analizerTools = this.tools.analizer.bind(this.tools);
    const plannerTools = this.tools.planner.bind(this.tools);
    const editorTools = this.tools.editor.bind(this.tools);
    const agent = new StateGraph(MessagesState)
      .addNode('analizer', this.analizer.exec.bind(this.analizer))
      .addNode('planner', this.planner.exec.bind(this.planner))
      .addNode('editor', this.editor.exec.bind(this.editor))
      .addNode('analizer_tools', analizerTools)
      .addNode('planner_tools', plannerTools)
      .addNode('editor_tools', editorTools)
      .addEdge(START, 'analizer')
      .addEdge('analizer_tools', 'analizer')
      .addEdge('planner_tools', 'planner')
      .addEdge('editor_tools', 'editor')
      .addNode('start_editor', this.startEditor.bind(this))
      .addEdge('start_editor', 'editor')
      .addConditionalEdges('analizer', this.analizerRouter.bind(this), [
        'analizer_tools',
        'planner',
        END,
      ])
      .addConditionalEdges('planner', this.plannerRouter.bind(this), [
        'planner_tools',
        'start_editor',
        END,
      ])
      .addConditionalEdges('editor', this.editorRouter.bind(this), [
        'editor_tools',
        'start_editor',
        END,
      ])
      .compile();

    this.agent = agent;
  }

  async exec(ctx: PlannerQuery) {
    console.log(parseHumanMessage(ctx).toJSON());
    const resp = await this.agent.invoke({
      analizerMessages: [parseHumanMessage(ctx)],
      plannerMessages: [parseHumanMessage(ctx)],
      editorMessages: [],
      instructions: [],
      intructionIndex: 0,
      ctx,
    });

    console.log('FINAL RESPONSE ', resp);
  }
}
