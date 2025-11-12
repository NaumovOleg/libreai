/* eslint-disable max-len */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { formFileContent, PromptProps } from '@utils';

export const CHAT_PROMPT = (data: PromptProps) => {
  return [
    new SystemMessage(`You are a highly skilled coding assistant with access to two tools: 
  1. "readFile" — use it to read the content of a file or a part of it when you need more context.
  2. "semanticSearch" — use it to search relevant code snippets or documentation in the workspace context.

Use these tools whenever you need additional information before answering the user.
If you call a tool, wait for its result before continuing.

  - Current file:  <***>${data.currentFilePath}<***>.
  - Selection:  <***>${data.selection}<***>.
  - Programming language:  <***>${data.language}<***>.
  - Files: ${formFileContent(data.files)}
  
  ---------

  Prevoius history : ${JSON.stringify(data.history, null, 1)} 
  `),
    new HumanMessage(`Instruction: <***>${data.text}<***>.`),
  ];
};
