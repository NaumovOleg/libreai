/* eslint-disable @typescript-eslint/no-explicit-any */
import { agent } from '@llamaindex/workflow';
import { LLMFactory } from '@llm';
import { Observer } from '@observer';
import {
  AgentMessagePayload,
  PlannerQuery,
  PlannerTask,
  raceAbortSignal,
  safeJsonParse,
  uuid,
} from '@utils';
import { FunctionTool, JSONValue } from 'llamaindex';
import * as vscode from 'vscode';
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
    abortSignal?: AbortSignal,
  ): Promise<{ error?: string; success: boolean; instructions: PlannerTask[]; text?: string }> {
    const id = uuid(4);
    const event: AgentMessagePayload<'planning'> = {
      id,
      status: 'pending',
      args: 'Planning',
      type: 'planning',
    };
    const observer = Observer.getInstance();
    observer.emit('agent', event);
    try {
      const data = JSON.stringify(request, null, 1.5);
      const response = await raceAbortSignal(() => this.agent.run(data), abortSignal);

      const result = safeJsonParse<string | PlannerTask[]>(response.data.result);
      event.status = 'done';
      observer.emit('agent', event);
      return {
        instructions: Array.isArray(result) ? result : [],
        text: !Array.isArray(result) ? result : '',
        success: Array.isArray(result),
      };
    } catch (err: any) {
      if (abortSignal?.aborted) {
        return { error: 'Operation aborted', success: false, instructions: [] };
      }
      event.status = 'error';
      event.error = err.message;
      vscode.window.showErrorMessage(err.message);
      observer.emit('agent', event);
      return { error: err.message, success: false, instructions: [] };
    }
  }
}
