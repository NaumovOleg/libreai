import { agent } from '@llamaindex/workflow';
import { LLMFactory } from '@llm';
import { Observer } from '@observer';
import { PlannerQuery, safeJsonParse, uuid } from '@utils';
import { FunctionTool, JSONValue } from 'llamaindex';

import { ANALYZER_AGENT_SYSTEM_PROMPT } from '../../prompts';

export class Analizer {
  LLMFactory = new LLMFactory();

  constructor(private tools: FunctionTool<JSONValue, JSONValue | Promise<JSONValue>, object>[]) {}

  get agent() {
    return agent({
      llm: this.LLMFactory.agent,
      tools: this.tools,
      systemPrompt: ANALYZER_AGENT_SYSTEM_PROMPT,
      verbose: false,
      name: 'Analizer assistant',
      description: 'An AI coding assistant.',
      logger: {
        log: (...args) => console.log('📝 ANALIZER LOG:', args),
        error: (...args) => console.error('❌ ANALIZER ERROR:', args),
        warn: (...args) => console.warn('⚠️ ANALIZER WARN:', args),
      },
    });
  }

  async run(request: PlannerQuery): Promise<{ nextStep: boolean; text?: string }> {
    const data = JSON.stringify(request, null, 1.5);

    const id = uuid(4);
    const event: AgentMessagePayload<'analizing'> = {
      id,
      status: 'pending',
      args: 'Analizing',
      type: 'analizing',
    };
    const observer = Observer.getInstance();
    observer.emit('agent', event);
    let nextStep = true;
    try {
      const response = await this.agent.run(data);
      const result = safeJsonParse<string | { nextStep: string }>(response.data.result);

      nextStep = !!(result as any).nextStep;

      return { nextStep, text: result.toString() };
    } catch (err: any) {
      event.status = 'error';
      event.error = err.message;
      return { nextStep: false, text: err.message };
    } finally {
      observer.emit('agent', { ...event, status: 'done' });
    }
  }
}
