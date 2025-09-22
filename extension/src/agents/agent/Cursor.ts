import { EditorObserver } from '../../observer';
import { PlannerQuery, ToolCallbacks } from '../../utils';
import { Executor, Planner } from './executors';
import { ollama, openAi } from './models';
import { ToolFactory } from './tools';

export class Cursor {
  private planner: Planner;
  private executor: Executor;

  constructor(cbks: ToolCallbacks) {
    const observer = EditorObserver.getInstance();
    this.planner = new Planner(ollama);
    const toolFactory = new ToolFactory(cbks, observer);
    this.executor = new Executor(openAi, toolFactory.tools);
  }

  async exec(input: PlannerQuery) {
    const tasks = await this.planner.run(input);
    console.log('planner output--------------------', tasks);

    const { output } = await this.executor.run(tasks);
    console.log('agent response, ++++++++++++++++++++++++++', output);
  }
}
