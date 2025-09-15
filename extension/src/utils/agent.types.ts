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
  task: PlanInstruction[];
  fileTree: string[];
  fileContents: {
    [key: string]: string;
  };
};
