import { LLMFactory } from '@llm';
import { AgentMessagePayload, PlannerQuery, PlannerTask, uuid } from '@utils';
import { z } from 'zod';

import { Observer } from '../../../observer';
import { PLANNER_SYSTEM_PROMPT, PLANNER_USER_PROMPT } from '../../prompts';
export class Planner {
  LLMFactory = new LLMFactory();
  private parser = z.object({
    tasks: z.array(
      z.union([
        z.object({
          file: z
            .string()
            .describe('Path to the file to edit. Exclude if there are commands to run'),
          task: z.string().describe('Instruction to apply. Include if there are file changes.'),
        }),
        z.object({
          command: z
            .string()
            .describe('Optional shell command to run. Exclude if there are file changes.'),
        }),
      ]),
    ),
  });

  get llm() {
    return this.LLMFactory.planner;
  }

  async run(query: PlannerQuery): Promise<PlannerTask[]> {
    const planningId = uuid(4);
    const event: AgentMessagePayload<'planning'> = {
      status: 'pending',
      args: 'Planning',
      id: planningId,
      type: 'planning',
    };
    const observer = Observer.getInstance();
    observer.emit('agent', event);

    try {
      const response = await this.llm.chat({
        responseFormat: this.parser,
        messages: [
          { role: 'system', content: PLANNER_SYSTEM_PROMPT(query) },
          { role: 'user', content: PLANNER_USER_PROMPT(query) },
        ],
      });
      event.status = 'done';

      const parsed = JSON.parse(response.message.content.toString());

      return parsed.tasks;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      event.status = 'error';
      event.error = err.message;
      throw new Error(err);
    } finally {
      observer.emit('agent', event);
    }
  }
}
