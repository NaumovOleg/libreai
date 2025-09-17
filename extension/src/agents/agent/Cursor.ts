import { ContextT, PlanInstruction } from '../../utils';
import { Executor, Planner } from './executors';
import { ollama } from './models';

export class Cursor {
  private planner: Planner;
  private executor: Executor;

  constructor() {
    this.planner = new Planner(ollama);
    this.executor = new Executor(ollama);
  }

  async exec(
    input: Pick<ContextT, 'fileTree' | 'workspaceContext' | 'language'> & { request: string },
  ) {
    let { output: response } = await this.planner.run(input);
    response = JSON.parse(response) as PlanInstruction;
    console.log('response, ++++++++++++++++++++++++++', response);
    const { output: instructions } = await this.executor.run(response);
    // instructions = JSON.parse(instructions) as PlanInstruction;
    console.log('instructions, ++++++++++++++++++++++++++', instructions);
  }
}
