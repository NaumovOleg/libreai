import { z } from 'zod';

import { PlannerQuery, PlannerTask } from '../../../utils';
import { ModelFactory } from '../../models';
import { PLANNER_SYSTEM_PROMPT, PLANNER_USER_PROMPT } from '../../prompts';

export class Planner {
  modelFactory = new ModelFactory();
  private parser = z.object({
    tasks: z.array(
      z.object({
        file: z.string().describe('Path to the file to edit. Exclude if there are commands to run'),
        task: z.string().describe('Instruction to apply. Exclude if there are file changes.'),
        command: z
          .string()
          .optional()
          .describe('Optional shell command to run. Exclude if there are file changes.'),
      }),
    ),
  });

  get llm() {
    return this.modelFactory.planner;
  }

  async run(query: PlannerQuery): Promise<PlannerTask[]> {
    return this.llm
      .chat({
        // responseFormat: this.parser,
        messages: [
          { role: 'system', content: PLANNER_SYSTEM_PROMPT },
          { role: 'user', content: PLANNER_USER_PROMPT(query) },
        ],
      })
      .then((resp) => JSON.parse(resp.message.content as string));
  }
}
