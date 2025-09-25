import { agent, AgentWorkflow } from '@llamaindex/workflow';
import { FunctionTool, ToolCallLLM } from 'llamaindex';

import { PlannerOutput } from '../../../utils';
import { SYSTEM_EXECUTOR_PROMPT } from '../../prompts';

export class Executor {
  private agent: AgentWorkflow;

  constructor(
    private llm: ToolCallLLM,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private tools: FunctionTool<any, any, any>[],
  ) {
    this.agent = agent({
      llm,
      tools,
      systemPrompt: SYSTEM_EXECUTOR_PROMPT,
    });
  }

  async run(query: PlannerOutput): Promise<any> {
    return this.agent.run(`Instructions: ${JSON.stringify(query, null, 2)}`);
  }
}
