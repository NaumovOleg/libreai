import * as vscode from 'vscode';

import {
  ContextT,
  EstimatedFile,
  getFileContentWithLineNumbers,
  PlanInstruction,
} from '../../utils';
import { Executor, Planner } from './executors';
import { ollama } from './models';
export class Cursor {
  private planner: Planner;
  private executor: Executor;

  constructor() {
    this.planner = new Planner(ollama);
    this.executor = new Executor(ollama);
  }

  private parseAIResponse(raw: string) {
    const cleaned = raw
      .replace(/```(?:json)?/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return Array.isArray(parsed) ? parsed : [parsed];
  }

  async exec(
    input: Pick<ContextT, 'fileTree' | 'workspaceContext' | 'language'> & { request: string },
  ) {
    const { output: response } = await this.planner.run(input);
    const estimatedFiles: EstimatedFile[] = [];
    const instructions: PlanInstruction[] = this.parseAIResponse(response);
    console.log('instructions, ++++++++++++++++++++++++++', instructions);
    instructions.forEach((instruction) => {
      instruction.estimatedFiles?.forEach(async (el) => {
        estimatedFiles.push(el);
      });
    });
    const fileContents: { [key: string]: string } = {};

    for (const file of estimatedFiles) {
      const uri = vscode.Uri.file(file.path);
      fileContents[file.path] = (await getFileContentWithLineNumbers(uri)) ?? '';
    }

    const tasks = instructions.map((instruction) => {
      const file = instruction.estimatedFiles[0].path;
      return {
        path: instruction.estimatedFiles[0].path,
        fileContent: fileContents[file],
        task: instruction.description,
        command: instruction.executeCommand?.[0],
      };
    });
    console.log('tasks, ++++++++++++++++++++++++++', tasks);

    const { output: resp } = await this.executor.run(tasks);
    // instructions = JSON.parse(instructions) as PlanInstruction;
    console.log('tools, ++++++++++++++++++++++++++', resp);
  }
}
