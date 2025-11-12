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
export type CreateFileToolArgs = {
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
