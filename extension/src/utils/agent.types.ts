import { ContextT } from './types';
export type EstimatedFile = { path: string; startLine: number; endLine: number };
export type PlanInstruction = {
  id: string;
  title: string;
  description: string;
  priority: string;
  estimatedFiles: EstimatedFile[];
  dependencies: string[];
  hasFollowUp: boolean;
  executeCommand?: string[];
};

export type ExecutorInstruction = {
  tasks: PlanInstruction[];
  fileTree: string[];
  fileContents: {
    [key: string]: string;
  };
};

export type PlannerQuery = Pick<ContextT, 'fileTree' | 'workspaceContext' | 'language'> & {
  request: string;
};
export type PlannerOutput = ({ file?: string; task?: string } | { command?: string })[];

export type EditFileToolArgs = {
  file: string;
  content: string;
  startLine: number;
  endLine: number;
  insertMode: string;
  taskId: string;
};
export type CreateToolArgs = {
  file: string;
  content: string;
  taskId: string;
};
export type CommandToolArgs = {
  command: string;
  taskId: string;
};
export type DeleteFileToolArgs = {
  file: string;
  taskId: string;
};
export type ReadFileToolArgs = {
  file: string;
  taskId: string;
};

export type RenameFileToolArgs = {
  file: string;
  taskId: string;
  newName: string;
};

export enum AGENT_TOOLS {
  editFile = 'editFile',
  commang = 'command',
  renameFile = 'renameFile',
  deleteFile = 'deleteFile',
  createFile = 'createFile',
  readFile = 'readFile',
}

export type ToolCallbacks = {
  [AGENT_TOOLS.editFile]: (args: EditFileToolArgs) => Promise<string | null>;
  [AGENT_TOOLS.commang]: (args: CommandToolArgs) => Promise<string | null>;
  [AGENT_TOOLS.renameFile]: (args: RenameFileToolArgs) => Promise<string | null>;
  [AGENT_TOOLS.deleteFile]: (args: DeleteFileToolArgs) => Promise<string | null>;
  [AGENT_TOOLS.createFile]: (args: CreateToolArgs) => Promise<string | null>;
  [AGENT_TOOLS.readFile]: (args: string) => Promise<string>;
};
