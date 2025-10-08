import { agent } from '@llamaindex/workflow';
import { FunctionTool, JSONValue } from 'llamaindex';

import { PlannerTask } from '../../../utils';
import { LLMFactory } from '../../llm';
import { SYSTEM_EXECUTOR_PROMPT } from '../../prompts';

export class Executor {
  LLMFactory = new LLMFactory();

  constructor(private tools: FunctionTool<JSONValue, JSONValue | Promise<JSONValue>, object>[]) {}

  get agent() {
    return agent({
      llm: this.LLMFactory.agent,
      tools: this.tools,
      systemPrompt: SYSTEM_EXECUTOR_PROMPT,
      verbose: true,
      name: 'Code copilot',
      logger: {
        log: (...args) => console.log('📝 AGENT LOG:', args),
        error: (...args) => console.error('❌ AGENT ERROR:', args),
        warn: (...args) => console.warn('⚠️ AGENT WARN:', args),
      },
    });
  }

  async run(tasks: PlannerTask[], language?: string) {
    const data = { language, tasks };

    return this.agent.run(JSON.stringify(data));
  }
}
