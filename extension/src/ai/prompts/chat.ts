/* eslint-disable max-len */

import { PromptMessages, PromptProps } from '../../utils';
export const CHAT_PROMPT = (data: PromptProps): PromptMessages => {
  return [
    {
      role: 'system',
      content: `You are a highly skilled coding assistant.
Use this project context, current file, selection and programming language  information to generate instructions accurately.
`,
    },
    {
      role: 'user',
      content: `
- Instruction: <***>${data.text}<***>.
- Project context: <***>${data.workspaceContext}<***>.
- Current file:  <***>${data.currentFilePath}<***>.
- Selection:  <***>${data.selection}<***>.
- Programming language:  <***>${data.language}<***>.`,
    },
  ];
};
