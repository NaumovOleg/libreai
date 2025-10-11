import { workflowEvent } from '@llamaindex/workflow';
import { PlannerQuery, PlannerTask } from '@utils';

export const startStep = workflowEvent<PlannerQuery>();

type ProcessorInput = {
  instructions: PlannerTask[];
  index: number;
  fileTree?: string[];
  output: string[];
};

export const startInstructionsStep = workflowEvent<{
  instructions: PlannerTask[];
  fileTree?: string[];
}>();
export const processTaskStep = workflowEvent<ProcessorInput>();
export const nextTaskStep = workflowEvent<ProcessorInput>();

export const finish = workflowEvent<{
  output: string[];
}>();
