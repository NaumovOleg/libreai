import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { RunnableSequence } from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';

import { PlannerOutput } from '../../../utils';
import { EXECUTOR_PROMPT } from '../prompts';

export class Executor {
  private agent: RunnableSequence;
  private executor: AgentExecutor;

  constructor(
    private llm: BaseChatModel,
    tools: DynamicStructuredTool[],
  ) {
    this.agent = createToolCallingAgent({
      llm,
      tools,
      prompt: EXECUTOR_PROMPT,
    });
    this.executor = new AgentExecutor({
      agent: this.agent,
      tools,
    });
  }

  run(data: PlannerOutput) {
    return this.executor.invoke({ tasks: JSON.stringify(data, null, 2) });
  }
}
