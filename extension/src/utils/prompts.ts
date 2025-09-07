/* eslint-disable max-len */
import { FILE_ACTIONS, PromptMessages } from './types';
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
  {
    role: 'user',
    content: `Complete the following code snippet: ${data.selection?.trim() || data.linePrefix?.trim()}`,
  },
];

export const CHAT_PROMPT = (message: string): PromptMessages => [
  {
    role: 'system',
    content: `You are a highly skilled coding assistant.`,
  },
  {
    role: 'user',
    content: message,
  },
];

type AgentPromptProps = {
  workspaceContext: string;
  selection: string;
  userPrompt: string;
  currentFilePath?: string;
};

export const AGENT_PROMPT = (data: AgentPromptProps): PromptMessages => {
  // editor?.document.uri.fsPath;
  return [
    {
      role: 'system',
      content:
        'You are a highly skilled coding assistant. Create, modify, rename or delete files in the project based on user prompt',
    },
    {
      role: 'user',
      content: `
Project context: ${data.workspaceContext}
Current file: ${data.currentFilePath || 'none'}
Selection: ${data.selection}
Instructions: ${data.userPrompt}
IMPORTANT!!! always return valid json and nothing else.
IMPORTANT!!! Escape all special characters in string values so the entire output is valid JSON. Replace newlines with \n and escape all quotes inside strings. Return only valid JSON, without comments or explanations.
Response example:
[
  {
    "action": "${FILE_ACTIONS.createFile}|${FILE_ACTIONS.updateFile}|${FILE_ACTIONS.renameFile}|${FILE_ACTIONS.deleteFile}",
    "file": "path/to/file",
    "content": "file content"
  }
]
`,
    },
  ];
};
