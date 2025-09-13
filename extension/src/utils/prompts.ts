/* eslint-disable max-len */
import { AGENT_ACTIONS, PromptMessages, PromptProps } from './types';
type SuggestionPromptParams = {
  selection?: string;
  workspaceContext?: string;
  linePrefix?: string;
  language?: string;
  currentFilePath: string;
  before: string;
  after: string;
};

export const INLINE_SUGGESTION_PROMPT = (data: SuggestionPromptParams): PromptMessages => [
  {
    role: 'system',
    content: `You are a highly skilled ${data.language ?? ''} coding assistant. Focus on correctness, readability, and modern ${data.language ?? ''} practices. Make completions concise and minimal, suitable for inline suggestions. Always respond only with working code. Do not include comments, explanations, or Markdown formatting. Return only the code snippet. Code snippet should replace <<<code suggestion>>>.`,
  },
  {
    role: 'system',
    content: `Use this information to from accurate response:
- Project context: ${data.workspaceContext}.
- Current file: ${data.currentFilePath || 'none'}.
- Selection: ${data.selection}.
- Programming language: ${data.language ?? ''}.`,
  },
  {
    role: 'user',
    content: `Context before cursor:
${data.before}
<<<code suggestion>>>
Context after cursor:
${data.after}`,
  },
];

export const CHAT_PROMPT = (data: PromptProps): PromptMessages => [
  {
    role: 'system',
    content: `You are a highly skilled coding assistant.
     Use this information to generate instructions accurately:
- Project context: ${data.workspaceContext}.
- History: ${data.history.join('\n')}. 
- Current file: ${data.currentFilePath || 'none'}.
- Selection: ${data.selection}.
- Programming language: ${data.language}.`,
  },
  {
    role: 'user',
    content: data.userPrompt,
  },
];

export const AGENT_PROMPTbackup = (data: PromptProps): PromptMessages => {
  return [
    {
      role: 'system',
      content: `You are an AI coding assistant. You provide instructions to the user for editing, creating, renaming and deleting code files or executing terminal commands step by step.
Rules:
1. Keep responses strictly in JSON format, no explanations, markdown, or extra text.
2. The field "content" must contain ONLY the code that should be inserted at the position specified in "position". 
  - Do NOT include any extra text, comments, or markdown.
  - Escape all special characters in string values (\n, quotes, etc.).
  - AI must **determine the exact range/position** in the file where the code should be applied. 
  - "position" should include "startLine", "endLine" to indicate where the code goes.
`,
    },
    { role: 'user', content: data.userPrompt },
    {
      role: 'user',
      content: `Use this information to generate instructions accurately:
  - File tree: ${data.fileTree}.
  - Project context: ${data.workspaceContext}.
  - History: ${data.history.join('\n')}.
  - Current file: ${data.currentFilePath || 'none'}.
  - Selection: ${data.selection}.
  - Programming language: ${data.language}.
Respond with an array of instructions in JSON format:
[{
  "language": "Programming language of generated snippet",
  "action": "${AGENT_ACTIONS.createFile}|${AGENT_ACTIONS.updateFile}|${AGENT_ACTIONS.renameFile}|${AGENT_ACTIONS.deleteFile}|${AGENT_ACTIONS.executeCommand}",
  "file": "relative path/to/file",
  "content": "ONLY code to insert at the range position, nothing else",
  "position": {"startLine":"...", "endLine":"..."},
  "newName": "new file name if renaming"
}]`,
    },
  ];
};
export const AGENT_PROMPT = (data: PromptProps): PromptMessages => {
  return [
    {
      role: 'system',
      content: `You are an AI coding assistant. You provide instructions to the user for editing, creating, renaming and deleting code files or executing terminal commands step by step.
Rules:
  1. Keep responses strictly in JSON format, no explanations, markdown, or extra text.
  2. The field "content" must contain ONLY the code that should be inserted or replaced at the position specified in "startLine" and "endLine" .
    - Escape all special characters in string values (\\n, quotes, etc.).
    - AI must **determine the exact range/position** in the file where the code should be applied.
  3. Specify the affected lines:
    - startLine (1-based): the index of the first line to be affected.
    - endLine (1-based): the index of the last line to be affected.
    - Both lines are inclusive. If startLine equals endLine, only that single line is affected.
    - The AI must determine whether to replace, insert, or delete lines based on the content..
  4. The "insertMode" field should indicate how the code should be applied:  
      - "replace": replace the lines in the specified range.
      - "insertBefore": insert before the startLine.
      - "insertAfter": insert after the endLine.
IMPORTANT!!! Always return valid json and nothing else.
IMPORTANT!!! Code snippet should be formatted, a single string, with all special characters escaped.
IMPORTANT!!! Escape all special characters in string values so the entire output is valid JSON. Replace newlines with \n and escape all quotes inside strings. Return only valid JSON, without comments or explanations.
`,
    },
    { role: 'user', content: data.userPrompt },
    {
      role: 'user',
      content: `Project Information:
        - File Tree: ${data.fileTree}
        - Project Context: ${data.workspaceContext}
        - Current File: ${data.currentFilePath} 
        - Selection: ${data.selection}
        - Language: ${data.language}
        Rules:
Respond with an array of instructions in JSON format:
[{
  "language": "Programming language of generated snippet",
  "action": "createFile|updateFile|renameFile|deleteFile|executeCommand",
  "file": "relative path/to/file",
  "content": "ONLY code to insert at the range position, nothing else",
  "startLine":"..."
  "endLine":"..."
  "insertMode": "replace|insertBefore|insertAfter",
  "newName": "new file name if renaming"
}]
  ***Do NOT add any comments, text outside JSON, or extra characters.
Return only a valid JSON array of objects. ***`,
    },
  ];
};
