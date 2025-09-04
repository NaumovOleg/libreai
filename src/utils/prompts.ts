/* eslint-disable max-len */
import { PromptMessages } from './types';
type SuggestionPromptParams = {
  selection?: string;
  workspaceContext?: string;
  linePrefix?: string;
  language: string;
};

export const INLINE_SUGGESTION_PROMPT = (data: SuggestionPromptParams): PromptMessages => [
  {
    role: 'system',
    content: `You are a coding assistant. Always respond only with working code. Use the ${data.language} programming language.`,
  },
  {
    role: 'user',
    content: `Complete the following code snippet:
    ${data.selection?.trim() || data.linePrefix?.trim()} 
    Workspace context:
    ${data.workspaceContext ?? ''}.
    IMPORTANT!!!: Do not include comments, explanations, Markdown formatting, or repeat the user's code or prompt. Return only the code snippet that completes or fixes the code.`,
  },
];
