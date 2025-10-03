import { EditorObserver } from '../observer';
import { EDITOR_EVENTS, PlannerQuery, ToolCallbacks, uuid } from '../utils';
import { Executor, Planner } from './agent/executors';
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
    const observer = EditorObserver.getInstance();
    const planningId = uuid(4);
    const processingId = uuid(4);
    observer.emit(EDITOR_EVENTS.planning, { status: 'pending', args: 'Planning', id: planningId });
    const tasks = await this.planner.run(input);
    observer.emit(EDITOR_EVENTS.planning, { status: 'done', args: 'Planning', id: planningId });
    observer.emit(EDITOR_EVENTS.planning, {
      status: 'pending',
      args: 'Thinking',
      id: processingId,
    });

    console.log('planner output--------------------', tasks);

    const executor = await this.executor.run(tasks, input.language);
    observer.emit(EDITOR_EVENTS.planning, {
      status: 'done',
      args: 'Thinking',
      id: processingId,
    });
    return executor;
  }
}
