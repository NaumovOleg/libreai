import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import { BaseLLM, BaseLLMCallOptions, BaseLLMParams } from '@langchain/core/language_models/llms';
import { LLMResult } from '@langchain/core/outputs';

interface AdvancedCustomLLMCallOptions extends BaseLLMCallOptions {}

interface AdvancedCustomLLMParams extends BaseLLMParams {
  n: number;
}

export class AdvancedCustomLLM extends BaseLLM<AdvancedCustomLLMCallOptions> {
  n: number;

  constructor(fields: AdvancedCustomLLMParams) {
    super(fields);
    this.n = fields.n;
  }

  _llmType() {
    return 'advanced_custom_llm';
  }

  async _generate(
    inputs: string[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<LLMResult> {
    const outputs = inputs.map((input) => input.slice(0, this.n));
    // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
    // await subRunnable.invoke(params, runManager?.getChild());

    // One input could generate multiple outputs.
    const generations = outputs.map((output) => [
      {
        text: output,
        // Optional additional metadata for the generation
        generationInfo: { outputCount: 1 },
      },
    ]);
    const tokenUsage = {
      usedTokens: this.n,
    };
    return {
      generations,
      llmOutput: { tokenUsage },
    };
  }
}
