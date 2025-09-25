import { ToolCallLLM } from 'llamaindex';
import { z } from 'zod';

import { PlannerOutput, PlannerQuery } from '../../../utils';
import { PLANNER_SYSTEM_PROMPT, PLANNER_USER_PROMPT } from '../../prompts';

export class Planner {
  private parser = z.array(
    z.object({
      file: z.string().describe('Path to the file to edit. Exclude if there are commands to run'),
      task: z.string().describe('Instruction to apply. Exctude if there are file changes.'),
      command: z
        .string()
        .optional()
        .describe('Optional shell command to run. Exctude if there are file changes.'),
    }),
  );

  constructor(private llm: ToolCallLLM) {}

  async run(query: PlannerQuery): Promise<PlannerOutput> {
    console.log(query);
    return this.llm
      .chat({
        responseFormat: this.parser,
        messages: [
          { role: 'system', content: PLANNER_SYSTEM_PROMPT },
          { role: 'user', content: PLANNER_USER_PROMPT(query) },
        ],
      })
      .then((resp) => JSON.parse(resp.message.content as string));
  }
}
