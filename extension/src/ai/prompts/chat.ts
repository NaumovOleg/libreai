/* eslint-disable max-len */
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';

export const CHAT_PROMPT = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `You are a highly skilled coding assistant.
Use this project context, current file, selection and programming language  information to generate instructions accurately.
`,
    { templateFormat: 'mustache' },
  ),
  ['placeholder', '{chat_history}'],
  HumanMessagePromptTemplate.fromTemplate(
    `Instruction: {{text}}
- Project context: {{workspaceContext}}.
- Current file:  {{currentFilePath}}.
- Selection:  {{selection}}.
- Programming language:  {{language}}.
    `,
    { templateFormat: 'mustache' },
  ),
  ['placeholder', '{agent_scratchpad}'],
]);
