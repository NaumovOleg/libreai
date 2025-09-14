export type PlanInstruction = {
  id: string;
  title: string;
  description: string;
  priority: string;
  estimatedFiles: string[];
  dependencies: string[];
  hasFollowUp: boolean;
  executeCommand?: string[];
};

export type ExecutorInstruction = {
  task: PlanInstruction[];
  fileTree: string;
  workspaceContext: string;
  fileContents: {
    [key: string]: string;
  };
};
