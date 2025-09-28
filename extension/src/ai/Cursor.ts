import { EditorObserver } from '../observer';
import { EDITOR_EVENTS, PlannerQuery, ToolCallbacks, uuid } from '../utils';
import { Executor, Planner } from './agent/executors';
import { ToolFactory2 } from './agent/tools';
import { ModelFactory, ollamaLlamaLocal } from './models';

export class Cursor {
  private planner: Planner;
  private executor: Executor;

  constructor(cbks: ToolCallbacks) {
    const models = new ModelFactory();
    this.planner = new Planner(ollamaLlamaLocal);
    const toolFactory = new ToolFactory2(cbks);
    this.executor = new Executor(models.agent, toolFactory.tools);
  }

  async exec(input: PlannerQuery) {
    const observer = EditorObserver.getInstance();
    const id = uuid(4);
    observer.emit(EDITOR_EVENTS.planning, { status: 'pending', args: 'planning', id });
    const tasks = await this.planner.run(input);
    observer.emit(EDITOR_EVENTS.planning, { status: 'done', args: 'planning', id });
    observer.emit(EDITOR_EVENTS.planning, { status: 'done', args: 'start processing', id });

    console.log('planner output--------------------', tasks);

    const executor = await this.executor.run(tasks, input.language);

    return executor;
  }
}
