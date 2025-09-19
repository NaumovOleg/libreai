/* eslint-disable max-len */
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';

export const PLANNER_PROMPT = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `You are a Task Planner for a coding assistant.
Your job is to analyze a user request and the workspace context, and return a minimal, clear list of actionable tasks.

***RULES***
  1. Return ONLY a JSON array (no prose, no markdown).
  2. Each task must follow the schema below.
  3. Use workspace-relative paths only.
  4. Prefer minimal number of tasks; combine small edits naturally.
  5. Do not invent files outside the workspace tree.
  6. Include "command" only if no file changes.

TASK JSON SCHEMA:
[
  {
    "task": "Clear single-sentence description",
    "file": "path/to/file
  },
  {"command":"npm install"}
]

***NOTE***:
    - "task": is an instruction to agent what shoul be done. Exclude if need to execute command.
    - "file": path to file.
    - "command": exact terminal command. Exclude if there are any file changes.

***Return ONLY a valid JSON array. Do NOT add any explanations, notes, or markdown. Do not include any text outside the JSON array.***`,
    { templateFormat: 'mustache' },
  ),
  ['placeholder', '{chat_history}'],
  HumanMessagePromptTemplate.fromTemplate(
    `
You will receive the following fields:
    - User request: user's natural-language request
    - Workspace tree: list of files/directories
    - Project Context: chunks of code with numbered lines.
    - Language: Programming language of workspace.

Task: produce a JSON array of tasks following the schema above.
Use only the information provided.
Do not add extra fields or guess outside the workspace.
Keep tasks actionable, conservative, and minimal.
Use this information to generate accurate responses:
    - File Tree: {{fileTree}}
    - Project Context: {{workspaceContext}}
    - Language: {{language}}
    - User request: {{request}}`,
    { templateFormat: 'mustache' },
  ),
  ['placeholder', '{agent_scratchpad}'],
]);
