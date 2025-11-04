import { createStatefulMiddleware, createWorkflow } from '@llamaindex/workflow';
import { Observer } from '@observer';
import { AgentSession } from '@services';
import { AgentMessagePayload, PlannerQuery, ToolCallbacks, uuid } from '@utils';
import * as vscode from 'vscode';
import {
  Analizer,
  analizerStep,
  Executor,
  finish,
  nextTaskStep,
  Planner,
  processTaskStep,
  startInstructionsStep,
  startStep,
  ToolFactory,
} from './agent';

const { withState } = createStatefulMiddleware();

export class Workflow {
  private workflow = withState(createWorkflow());
  private planner: Planner;
  private executor: Executor;
  private analizer: Analizer;
  private session: AgentSession;
  private abortController: AbortController | null = null;

  constructor(cbks: Omit<ToolCallbacks, 'planning'>) {
    const toolFactory = new ToolFactory(cbks);
    this.session = AgentSession.getInstance();
    this.planner = new Planner(toolFactory.plannerTools);
    this.executor = new Executor(toolFactory.executorTools);
    this.analizer = new Analizer(toolFactory.analizerTools);

    this.workflow.handle([analizerStep], async (event, context) => {
      if (this.abortController?.signal.aborted) throw new Error('Workflow aborted');
      const { nextStep, text } = await this.analizer.run(
        context.data,
        this.abortController?.signal,
      );
      if (!nextStep) {
        return finish.with({ output: [text ?? ''] });
      }
      return startStep.with(context.data);
    });

    this.workflow.handle([startStep], async (event, context) => {
      if (this.abortController?.signal.aborted) throw new Error('Workflow aborted');
      const { error, success, text, instructions } = await this.planner.run(
        context.data,
        this.abortController?.signal,
      );
      if (error || !success) {
        return finish.with({ output: [error ?? text ?? ''] });
      }
      return startInstructionsStep.with({ fileTree: context.data.fileTree, instructions });
    });

    this.workflow.handle([startInstructionsStep], async (event, context) => {
      if (this.abortController?.signal.aborted) throw new Error('Workflow aborted');
      return processTaskStep.with({
        fileTree: context.data.fileTree,
        instructions: context.data.instructions,
        index: 0,
        output: [],
      });
    });

    this.workflow.handle([processTaskStep], async (event, context) => {
      if (this.abortController?.signal.aborted) throw new Error('Workflow aborted');
      const index = context.data.index;
      const instruction = context.data.instructions[index];
      const response = await this.executor.run(
        instruction,
        context.data.fileTree,
        this.abortController?.signal,
      );

      const output = context.data.output.concat(
        typeof response === 'string' ? response : response.error,
      );

      return nextTaskStep.with({ ...context.data, output });
    });

    this.workflow.handle([nextTaskStep], async (event, context) => {
      if (this.abortController?.signal.aborted) throw new Error('Workflow aborted');
      const index = context.data.index + 1;
      if (context.data.instructions.length <= index) {
        return finish.with({ output: context.data.output });
      }
      return processTaskStep.with({ ...context.data, index });
    });
  }

  async run(data: PlannerQuery) {
    await this.session.reset();
    const observer = Observer.getInstance();
    this.abortController = new AbortController();

    try {
      const resultEvent: AgentMessagePayload<'agentResponse'> = {
        status: 'done',
        id: uuid(),
        args: {},
        type: 'agentResponse',
      };
      const { stream, sendEvent } = this.workflow.createContext();
      sendEvent(analizerStep.with(data));

      for await (const event of stream) {
        if (this.abortController.signal.aborted) {
          break;
        }
        if (finish.include(event)) {
          resultEvent.args.content = event.data.output.toString();
          observer.emit('agent', resultEvent);
          break;
        }
      }

      return 'done';
    } catch (err: any) {
      if (err.message === 'Workflow aborted') {
        vscode.window.showInformationMessage('Agent workflow was aborted.');
      } else {
        vscode.window.showErrorMessage(err.message);
      }
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
