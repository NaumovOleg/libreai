/* eslint-disable max-len */

import { PromptMessages, PromptProps } from '../../utils';
export const CHAT_PROMPT = (data: PromptProps): PromptMessages => {
  return [
    {
      role: 'system',
      content: `You are a highly skilled coding assistant.
Use this project context, current file, selection, programming language and files content information to generate responses accurately.
  - Project context: <***>${data.workspaceContext}<***>.
  - Current file:  <***>${data.currentFilePath}<***>.
  - Selection:  <***>${data.selection}<***>.
  - Programming language:  <***>${data.language}<***>.
  - Files: ${JSON.stringify(data.files, null, 1.5)}`,
    },
    { role: 'user', content: `Instruction: <***>${data.text}<***>.` },
  ];
};
