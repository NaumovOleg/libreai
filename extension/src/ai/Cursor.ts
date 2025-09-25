import { PlannerQuery, ToolCallbacks } from '../utils';
import { Executor2, PlannerNext } from './agent/executors';
import { ToolFactory2 } from './agent/llamatools';
import { ollamaLlama, openAiLlama } from './models';

export class Cursor {
  private planner: PlannerNext;
  private executor: Executor2;

  constructor(cbks: ToolCallbacks) {
    this.planner = new PlannerNext(ollamaLlama);
    const toolFactory = new ToolFactory2(cbks);
    this.executor = new Executor2(openAiLlama, toolFactory.tools);
  }

  async exec(input: PlannerQuery) {
    // const observer = EditorObserver.getInstance();
    // const id = uuid(4);
    // observer.emit(EDITOR_EVENTS.planning, { status: 'pending', args: 'planning', id });
    // const tasks = await this.planner.run(input);
    // observer.emit(EDITOR_EVENTS.planning, { status: 'done', args: 'planning', id });
    // observer.emit(EDITOR_EVENTS.planning, { status: 'done', args: 'start processing', id });

    const tasks = [
      {
        file: 'services/userService.ts',
        task: 'Add removeUserById method to user service',
      },
    ];

    console.log('planner output--------------------', tasks);

    const executor = await this.executor.run(tasks);

    console.log('executor output--------------------', executor);
    return 'output';
  }
}
