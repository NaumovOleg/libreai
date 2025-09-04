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
    content: `You are a highly skilled ${data.language} coding assistant. Always respond only with working code. Do not include comments, explanations, or Markdown formatting. Do not repeat the user's code or prompt. Return only the code snippet that completes or fixes the code.`,
  },
  {
    role: 'system',
    content: `Focus on correctness, readability, and modern ${data.language} practices. Make completions concise and minimal, suitable for inline suggestions.`,
  },
  // {
  //   role: 'user',
  //   content: `Workspace context: ${data.workspaceContext ?? ''}.`,
  // },
  {
    role: 'user',
    content: `Complete the following code snippet: ${data.selection?.trim() || data.linePrefix?.trim()}`,
  },
];
