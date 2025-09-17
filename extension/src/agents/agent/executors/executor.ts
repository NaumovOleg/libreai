import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { RunnableSequence } from '@langchain/core/runnables';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';

import { PlanInstruction } from '../../../utils';
import { EXECUTOR_PROMPT } from '../prompts';

export class Executor {
  private agent: RunnableSequence;
  private executor: AgentExecutor;

  constructor(private llm: BaseChatModel) {
    this.agent = createToolCallingAgent({
      llm,
      tools: [],
      prompt: EXECUTOR_PROMPT,
    });
    this.executor = new AgentExecutor({
      agent: this.agent,
      tools: [],
    });
  }

  run(instructions: PlanInstruction) {
    return this.executor.invoke({ instructions: JSON.stringify(instructions) });
  }
}
