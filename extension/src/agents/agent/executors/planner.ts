import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { RunnableSequence } from '@langchain/core/runnables';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';

import { ContextT } from '../../../utils';
import { PLANNER_PROMPT } from '../prompts';

export class Planner {
  private agent: RunnableSequence;
  private executor: AgentExecutor;

  constructor(private llm: BaseChatModel) {
    this.agent = createToolCallingAgent({
      llm,
      tools: [],
      prompt: PLANNER_PROMPT,
    });
    this.executor = new AgentExecutor({
      agent: this.agent,
      tools: [],
    });
  }

  run(query: Pick<ContextT, 'fileTree' | 'workspaceContext' | 'language'> & { request: string }) {
    return this.executor.invoke(query);
  }
}
