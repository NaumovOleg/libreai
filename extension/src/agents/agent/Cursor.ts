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

  private parseAIResponse<T>(raw: string): T[] {
    const cleaned = raw
      .replace(/```(?:json)?/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return Array.isArray(parsed) ? parsed : [parsed];
  }

  async exec(
    input: Pick<ContextT, 'fileTree' | 'workspaceContext' | 'language'> & { request: string },
  ) {
    let { output: response } = await this.planner.run(input);

    response = this.parseAIResponse<PlanInstruction>(response);
    console.log('response, ++++++++++++++++++++++++++', response);
    const { output: instructions } = await this.executor.run(response);
    // instructions = JSON.parse(instructions) as PlanInstruction;
    console.log('instructions, ++++++++++++++++++++++++++', instructions);
  }
}
