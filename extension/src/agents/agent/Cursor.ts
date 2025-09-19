import { ContextT } from '../../utils';
import { Executor, Planner } from './executors';
import { ollama, openAi } from './models';

export class Cursor {
  private planner: Planner;
  private executor: Executor;

  constructor() {
    this.planner = new Planner(ollama);
    this.executor = new Executor(openAi);
  }

  async exec(
    input: Pick<ContextT, 'fileTree' | 'workspaceContext' | 'language'> & { request: string },
  ) {
    const tasks = await this.planner.run(input);
    console.log('planner output--------------------', tasks);

    const { output } = await this.executor.run(tasks);
    console.log('agent response, ++++++++++++++++++++++++++', output);
  }
}
