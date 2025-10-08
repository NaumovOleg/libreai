/* eslint-disable max-len */

import { SuggestionPromptParams } from '../../utils';

export const INLINE_SUGGESTION_PROMPT = (data: SuggestionPromptParams) => {
  return `
You are an AI code completion engine. Your task is to **insert code exactly at the cursor position**, without modifying existing code before or after.

RULES:
- Do NOT change or repeat code before or after the cursor.
- Do NOT introduce unrelated functions, variables, or wrappers.
- Only insert the next logical code that fits between the existing code.
- Output must be raw, syntactically correct code.
- No comments, explanations, markdown, or quotes.
- Keep code concise and minimal, suitable for inline suggestions.

### Code Before Cursor:
${data.before}

### Code After Cursor:
${data.after || ''}

### Completion (Insert here):
`;
};
