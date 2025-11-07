import { ContextT } from './types';

export type PlannerQuery = Pick<ContextT, 'fileTree' | 'language'> & {
  request: string;
} & { files?: { file: string; content: string }[] };
export type PlannerTask = { file: string; task: string } | { command?: string };

export type EditFileToolArgs = {
  file: string;
  content: string;
  old?: string;
};
export type CreateToolArgs = {
  file: string;
  content: string;
};
export type CommandToolArgs = {
  command: string;
  result?: string;
};
export type DeleteFileToolArgs = {
  file: string;
};
export type ReadFileToolArgs = {
  file: string;
};

export type RenameFileToolArgs = {
  file: string;
  newName: string;
};
export type SemanticSearchToolArgs = {
  search: string;
  limit: number;
};

export enum AGENT_TOOLS {
  editFile = 'editFile',
  command = 'command',
  renameFile = 'renameFile',
  deleteFile = 'deleteFile',
  createFile = 'createFile',
  readFile = 'readFile',
  planning = 'planning',
  semanticSearch = 'semanticSearch',
}

export type ToolCallbacks = {
  [AGENT_TOOLS.editFile]: (
    args: EditFileToolArgs,
  ) => Promise<{ old: string; content: string; file: string } | null>;
  [AGENT_TOOLS.command]: (args: CommandToolArgs) => Promise<string>;
  [AGENT_TOOLS.renameFile]: (args: RenameFileToolArgs) => Promise<string | null>;
  [AGENT_TOOLS.deleteFile]: (args: DeleteFileToolArgs) => Promise<string | null>;
  [AGENT_TOOLS.createFile]: (args: CreateToolArgs) => Promise<string | null>;
  [AGENT_TOOLS.readFile]: (args: string) => Promise<string>;
  [AGENT_TOOLS.planning]: (args: string) => Promise<string>;
  [AGENT_TOOLS.semanticSearch]: (
    args: SemanticSearchToolArgs,
  ) => Promise<
    { path: string; text: string; startLine: number; endLine: number; workspace: string }[]
  >;
};
