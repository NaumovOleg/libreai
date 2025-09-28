import { EditorObserver } from '../observer';
import { EDITOR_EVENTS, PlannerQuery, ToolCallbacks, uuid } from '../utils';
import { Executor, Planner } from './agent/executors';
import { ToolFactory2 } from './agent/tools';
import { ollamaLlama, ollamaLlamaLocal } from './models';

export class Cursor {
  private planner: Planner;
  private executor: Executor;

  constructor(cbks: ToolCallbacks) {
    this.planner = new Planner(ollamaLlamaLocal);
    const toolFactory = new ToolFactory2(cbks);
    this.executor = new Executor(ollamaLlama, toolFactory.tools);
  }

  async exec(input: PlannerQuery) {
    const observer = EditorObserver.getInstance();
    const id = uuid(4);
    observer.emit(EDITOR_EVENTS.planning, { status: 'pending', args: 'planning', id });
    const tasks = await this.planner.run(input);
    observer.emit(EDITOR_EVENTS.planning, { status: 'done', args: 'planning', id });
    observer.emit(EDITOR_EVENTS.planning, { status: 'done', args: 'start processing', id });

    // const tasks = [
    //   {
    //     file: 'services/userService.ts',
    //     task: 'Add removeUserById method to user service',
    //   },
    // ];

    console.log('planner output--------------------', tasks);

    const executor = await this.executor.run(tasks);

    return executor;
  }
}
