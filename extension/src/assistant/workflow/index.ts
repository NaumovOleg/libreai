import { type CompiledStateGraph, END, START, StateGraph } from '@langchain/langgraph';
import { Observer } from '@observer';
import { AgentSession } from '@services';
import { AgentMessagePayload, PlannerQuery, uuid } from '@utils';
import * as vscode from 'vscode';

import { MessagesState, parseHumanMessage } from '../helper';
import { Analizer, Editor, Planner, ToolNode } from '../nodes';
import { Flow } from './flow';
export class GraphWorkflow extends Flow {
  analizer: Analizer;
  planner: Planner;
  editor: Editor;
  tools: ToolNode;
  private session: AgentSession;
  private abortController: AbortController | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: CompiledStateGraph<any, any, any, any>;

  constructor() {
    super();
    this.session = AgentSession.getInstance();
    this.analizer = new Analizer();
    this.planner = new Planner();
    this.editor = new Editor();
    this.tools = new ToolNode();
    const analizerTools = this.tools.analizer.bind(this.tools);
    const plannerTools = this.tools.planner.bind(this.tools);
    const editorTools = this.tools.editor.bind(this.tools);
    const agent = new StateGraph(MessagesState)
      .addNode('start_analizer', this.startAnalizer.bind(this))
      .addNode('end_analizer', this.endAnalizer.bind(this))
      .addNode('finish_analizer', this.endAnalizer.bind(this))
      .addNode('start_planner', this.startPlanner.bind(this))
      .addNode('end_planner', this.endPlanner.bind(this))
      .addNode('finish_planner', this.endPlanner.bind(this))
      .addNode('analizer', this.analizer.exec.bind(this.analizer))
      .addNode('planner', this.planner.exec.bind(this.planner))
      .addNode('editor', this.editor.exec.bind(this.editor))
      .addNode('analizer_tools', analizerTools)
      .addNode('planner_tools', plannerTools)
      .addNode('editor_tools', editorTools)
      .addNode('start_editor', this.startEditor.bind(this))
      .addEdge(START, 'start_analizer')
      .addEdge('start_analizer', 'analizer')
      .addEdge('analizer_tools', 'analizer')
      .addEdge('end_analizer', 'start_planner')
      .addEdge('start_planner', 'planner')
      .addEdge('end_analizer', 'start_planner')
      .addEdge('planner_tools', 'planner')
      .addEdge('end_planner', 'start_editor')
      .addEdge('start_editor', 'editor')
      .addEdge('editor_tools', 'editor')
      .addEdge('finish_analizer', END)
      .addEdge('finish_planner', END)
      .addConditionalEdges('analizer', this.analizerRouter.bind(this), [
        'analizer_tools',
        'end_analizer',
        'finish_analizer',
      ])
      .addConditionalEdges('planner', this.plannerRouter.bind(this), [
        'planner_tools',
        'end_planner',
        'finish_planner',
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
    const observer = Observer.getInstance();
    this.session.reset();
    this.abortController = new AbortController();
    const finshId = uuid();
    const resultEvent: AgentMessagePayload<'agentResponse'> = {
      status: 'done',
      id: finshId,
      args: {},
      type: 'agentResponse',
    };
    try {
      const state = await this.agent.invoke(
        {
          analizerMessages: [parseHumanMessage(ctx)],
          plannerMessages: [parseHumanMessage(ctx)],
          editorMessages: [],
          instructions: [],
          intructionIndex: 0,
          analizerId: uuid(7),
          plannerId: uuid(7),
          editorId: uuid(7),
          ctx,
          finalEventId: finshId,
        },
        { signal: this.abortController?.signal, recursionLimit: 2000 },
      );

      console.log('FINAL RESPONSE ', state);

      const last = (Array.isArray(state.response) ? state.response : [state.response]).at(-1);

      resultEvent.args.content = last.content.toString();
      observer.emit('agent', resultEvent);

      return 'done';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message === 'Workflow aborted') {
        vscode.window.showInformationMessage('Agent workflow was aborted.');
      } else {
        vscode.window.showErrorMessage(err.message);
      }
      resultEvent.status = 'error';
      resultEvent.error = err.message;
      observer.emit('agent', resultEvent);
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      const observer = Observer.getInstance();
      observer.emit('abortAgentFlow');
    }
  }
}
