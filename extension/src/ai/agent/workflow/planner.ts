import { agent } from '@llamaindex/workflow';
import { LLMFactory } from '@llm';
import { PlannerQuery, PlannerTask } from '@utils';
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

  async run(request: PlannerQuery): Promise<PlannerTask[]> {
    const data = JSON.stringify(request, null, 1.5);
    const response = await this.agent.run(data);

    const tasks = JSON.parse((response.data.message?.content as string) ?? { tasks: [] });
    console.log('PLANNER TASKS--------->', tasks);
    return tasks;
  }
}
