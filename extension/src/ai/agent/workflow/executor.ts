import { agent } from '@llamaindex/workflow';
import { LLMFactory } from '@llm';
import { PlannerTask } from '@utils';
import { FunctionTool, JSONValue } from 'llamaindex';

import { SYSTEM_EXECUTOR_PROMPT } from '../../prompts';

export class Executor {
  LLMFactory = new LLMFactory();

  constructor(private tools: FunctionTool<JSONValue, JSONValue | Promise<JSONValue>, object>[]) {}

  get agent() {
    return agent({
      llm: this.LLMFactory.agent,
      tools: this.tools,
      systemPrompt: SYSTEM_EXECUTOR_PROMPT,
      verbose: false,
      name: 'Code copilot',
      description:
        // eslint-disable-next-line max-len
        'An AI coding copilot that executes coding tasks, edits files, creates new files, and runs commands based on structured instructions. It strictly follows the system prompt rules, ensuring only necessary file changes and tool calls are made, without providing explanations or plain text output.',
      logger: {
        log: (...args) => console.log('📝 AGENT LOG:', args),
        error: (...args) => console.error('❌ AGENT ERROR:', args),
        warn: (...args) => console.warn('⚠️ AGENT WARN:', args),
      },
    });
  }

  async run(instruction: PlannerTask, fileTree?: string[]) {
    const data = JSON.stringify({ fileTree, instruction }, null, 1.5);
    return this.agent.run(data);
  }
}
