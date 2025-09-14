export type PlanInstruction = {
  id: string;
  title: string;
  description: string;
  priority: string;
  estimatedFiles: { path: string; startLine: number; endLine: number }[];
  dependencies: string[];
  hasFollowUp: boolean;
  executeCommand?: string[];
};

export type ExecutorInstruction = {
  task: PlanInstruction[];
  fileTree: string;
  fileContents: {
    [key: string]: string;
  };
};
