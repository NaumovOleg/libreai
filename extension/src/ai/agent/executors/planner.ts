import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptValue } from '@langchain/core/prompt_values';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';

import { PlannerOutput, PlannerQuery } from '../../../utils';
import { PLANNER_PROMPT } from '../../prompts';

export class Planner {
  private parser = StructuredOutputParser.fromZodSchema(
    z.array(
      z.object({
        file: z
          .string()
          .optional()
          .describe('Path to the file to edit. Exclude if there are commands to run'),
        task: z
          .string()
          .optional()
          .describe('Instruction to apply. Exctude if there are file changes.'),
        command: z
          .string()
          .optional()
          .describe('Optional shell command to run. Exctude if there are file changes.'),
      }),
    ),
  );
  private chain: RunnableSequence<PlannerQuery, PlannerOutput>;

  constructor(private llm: BaseChatModel) {
    this.chain = this.chain = RunnableSequence.from([
      async (query) => {
        const messages = await PLANNER_PROMPT.formatMessages({
          ...query,
          format_instructions: this.parser.getFormatInstructions(),
        });

        return new ChatPromptValue(messages);
      },
      this.llm,
      this.parser,
    ]);
  }

  async run(query: PlannerQuery) {
    return this.chain.invoke(query);
  }
}
