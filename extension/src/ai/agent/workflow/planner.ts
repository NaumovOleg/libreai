import { agent } from '@llamaindex/workflow';
import { LLMFactory } from '@llm';
import { Observer } from '@observer';
import { PlannerQuery, PlannerTask, uuid } from '@utils';
import { FunctionTool, JSONValue } from 'llamaindex';

import { PLANNER_AGENT_SYSTEM_PROMPT } from '../../prompts';

export class Planner {
  LLMFactory = new LLMFactory();

  constructor(private tools: FunctionTool<JSONValue, JSONValue | Promise<JSONValue>, object>[]) {}

  get agent() {
    return agent({
      llm: this.LLMFactory.agent,
      tools: this.tools,
      systemPrompt: PLANNER_AGENT_SYSTEM_PROMPT,
      verbose: false,
      name: 'Planner assistant',
      description: 'An AI coding assistant.',
      logger: {
        log: (...args) => console.log('📝 PLANNER LOG:', args),
        error: (...args) => console.error('❌ PLANNER ERROR:', args),
        warn: (...args) => console.warn('⚠️ PLANNER WARN:', args),
      },
    });
  }

  async run(
    request: PlannerQuery,
  ): Promise<{ error?: string; success: boolean; instructions: PlannerTask[] }> {
    const data = JSON.stringify(request, null, 1.5);

    const planningId = uuid(4);
    const event: AgentMessagePayload<'planning'> = {
      status: 'pending',
      args: 'Planning',
      id: planningId,
      type: 'planning',
    };
    const observer = Observer.getInstance();
    observer.emit('agent', event);
    try {
      const response = await this.agent.run(data);

      const instructions = JSON.parse((response.data.message?.content as string) ?? { tasks: [] });
      console.log('PLANNER TASKS--------->', instructions);
      return { instructions, success: true };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      event.status = 'error';
      event.error = err.message;
      observer.emit('agent', event);
      return { error: err.message, success: false, instructions: [] };
    }
  }
}
