import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { RunnableSequence } from '@langchain/core/runnables';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';

import { EXECUTOR_PROMPT } from '../prompts';
import { createFile, deleteFile, executeCommandTool, renameFile, updateFileTool } from '../tools';

const tools = [renameFile, createFile, updateFileTool, deleteFile, executeCommandTool];

export class Executor {
  private agent: RunnableSequence;
  private executor: AgentExecutor;

  constructor(private llm: BaseChatModel) {
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

  run(data: any) {
    return this.executor.invoke({ tasks: JSON.stringify(data) });
  }
}
