import { PlannerQuery, ToolCallbacks } from '../utils';
import { Executor, Planner } from './agent/steps';
import { ToolFactory2 } from './agent/tools';

export class Cursor {
  private planner: Planner;
  private executor: Executor;

  constructor(cbks: ToolCallbacks) {
    this.planner = new Planner();
    const toolFactory = new ToolFactory2(cbks);
    this.executor = new Executor(toolFactory.tools);
  }

  async exec(input: PlannerQuery) {
    // const observer = Observer.getInstance();

    const tasks = await this.planner.run(input);

    console.log('planner output--------------------', tasks);

    return '';
    // const resultEvent: AgentMessagePayload<'agentResponse'> = {
    //   status: 'done',
    //   id: uuid(),
    //   args: {},
    //   type: 'agentResponse',
    // };

    // try {
    //   const response = await this.executor.run(tasks, input.language);
    //   resultEvent.args.content = response.data.message.content.toString();
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // } catch (err: any) {
    //   resultEvent.error = err.message;
    // }

    // observer.emit('agent', resultEvent);
    // return 'done';
  }
}
