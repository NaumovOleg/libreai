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

export const AGENT_PROMPT = (data: PromptProps): PromptMessages => {
  return [
    {
      role: 'system',
      content: `You are an AI coding assistant. You provide instructions to the user for editing, creating, renaming and deleting code files or executing terminal commands step by step.
Rules:
1. Use this information to generate instructions accurately:
- Project context: ${data.workspaceContext}.
- History: ${data.history.join('\n')}. 
- Current file: ${data.currentFilePath || 'none'}.
- Selection: ${data.selection}.
- Programming language: ${data.language}.
2. Keep responses strictly in JSON format, no explanations, markdown, or extra text.
IMPORTANT!!! Always return valid json and nothing else.
IMPORTANT!!! Code snippet should be formatted, a single string, with all special characters escaped.
IMPORTANT!!! Escape all special characters in string values so the entire output is valid JSON. Replace newlines with \n and escape all quotes inside strings. Return only valid JSON, without comments or explanations.
3. Respond with **array of instructions** in JSON format:
[{
  "language": "Programming language of generated snippet"
  "action": "${AGENT_ACTIONS.createFile}|${AGENT_ACTIONS.updateFile}|${AGENT_ACTIONS.renameFile}|${AGENT_ACTIONS.deleteFile}|${AGENT_ACTIONS.executeCommand}",
  "file": "relative path/to/file",
  "content": "file content or bash command",
  "newName": "new file name",
}]
`,
    },
    { role: 'user', content: data.userPrompt },
  ];
};
