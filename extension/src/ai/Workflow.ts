import { createStatefulMiddleware, createWorkflow } from '@llamaindex/workflow';
import { Observer } from '@observer';
import { AgentMessagePayload, PlannerQuery, ToolCallbacks, uuid } from '@utils';

import {
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

  constructor(cbks: ToolCallbacks) {
    this.planner = new Planner();
    const toolFactory = new ToolFactory(cbks);
    this.executor = new Executor(toolFactory.tools);
    this.workflow.handle([startStep], async (event, context) => {
      const instructions = await this.planner.run(context.data);
      return startInstructionsStep.with({ fileTree: context.data.fileTree, instructions });
    });

    this.workflow.handle([startInstructionsStep], async (event, context) => {
      return processTaskStep.with({
        fileTree: context.data.fileTree,
        instructions: context.data.instructions,
        index: 0,
        output: [],
      });
    });

    this.workflow.handle([processTaskStep], async (event, context) => {
      const index = context.data.index;
      const instruction = context.data.instructions[index];
      const response = await this.executor.run(instruction, context.data.fileTree);
      const output = context.data.output.concat(response.data.message.content.toString());

      return nextTaskStep.with({ ...context.data, output });
    });

    this.workflow.handle([nextTaskStep], async (event, context) => {
      const index = context.data.index + 1;
      if (context.data.instructions.length <= index) {
        return finish.with({ output: context.data.output });
      }
      return processTaskStep.with({ ...context.data, index });
    });
  }

  async run(data: PlannerQuery) {
    const observer = Observer.getInstance();

    const resultEvent: AgentMessagePayload<'agentResponse'> = {
      status: 'done',
      id: uuid(),
      args: {},
      type: 'agentResponse',
    };
    const { stream, sendEvent } = this.workflow.createContext();
    sendEvent(startStep.with(data));

    for await (const event of stream) {
      if (finish.include(event)) {
        resultEvent.args.content = event.data.output.toString();
        observer.emit('agent', resultEvent);
        break;
      }
    }

    return 'done';
  }
}
