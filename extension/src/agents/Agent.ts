import { execSync } from 'child_process';
import path from 'path';
import * as vscode from 'vscode';

import { AIClient } from '../clients';
import {
  AGENT_ACTIONS,
  AgentInstruction,
  ContextData,
  EXECUTOR_PROMPT,
  getFileContent,
  PlanInstruction,
  PLANNER_PROMPT,
  resolveFilePath,
} from '../utils';

export class Agent {
  constructor(private aiClient: AIClient) {}

  private parseAIResponse<T>(raw: string): T[] {
    const cleaned = raw
      .replace(/```(?:json)?/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return Array.isArray(parsed) ? parsed : [parsed];
  }

  async proceed(data: ContextData) {
    console.log('CONTEXT--------------', data);
    const planner = await this.planner(data);
    console.log('PLANNER RESPONSE ++++++++++++++++++', planner);
    const instructions = await this.executor({ instructions: planner, fileTree: data.fileTree });
    console.log('EXECUTOR RESPONSE ++++++++++++++++++', instructions);
    return instructions;
  }

  async planner(data: {
    userPrompt: string;
    history: string[];
    selection: string;
    currentFilePath: string;
    workspaceContext: string;
    language?: string;
    fileTree: string;
  }) {
    const plannerMessages = PLANNER_PROMPT(data);

    console.log('PLANNER MESSAGES --------------', plannerMessages);

    let aiResponse = '';
    for await (const chunk of this.aiClient.chat(plannerMessages)) {
      aiResponse += chunk;
    }

    return this.parseAIResponse<PlanInstruction>(aiResponse);
  }

  async executor(data: { instructions: PlanInstruction[]; fileTree: string }) {
    const paths = {} as { [key: string]: string };
    data.instructions.forEach((instruction) => {
      instruction.estimatedFiles.forEach(async (el) => {
        if (!paths[el.path]) {
          paths[el.path] = el.path;
        }
      });
    });
    const fileContents: { [key: string]: string } = {};

    for (const filePath of Object.keys(paths)) {
      try {
        const uri = vscode.Uri.file(filePath);
        fileContents[filePath] = await getFileContent(uri);
      } catch (err) {
        console.error(`Failed to read file ${filePath}:`, err);
        fileContents[filePath] = '';
      }
    }

    const executorMessages = EXECUTOR_PROMPT({
      fileTree: data.fileTree,
      fileContents,
      task: data.instructions,
    });

    console.log('EXECUTOR MESSAGES --------------', executorMessages);

    let aiResponse = '';
    for await (const chunk of this.aiClient.chat(executorMessages)) {
      aiResponse += chunk;
    }

    return this.parseAIResponse<AgentInstruction>(aiResponse);
  }

  private async createOrUpdateFile(instr: AgentInstruction, root: string) {
    const uri = resolveFilePath(instr.file, root);

    try {
      await vscode.workspace.fs.stat(uri);
    } catch {
      await this.ensureDirectory(uri);
      await vscode.workspace.fs.writeFile(uri, Buffer.from('', 'utf-8'));
    }

    const document = await vscode.workspace.openTextDocument(uri);
    const edit = new vscode.WorkspaceEdit();

    const start = new vscode.Position(instr.startLine ?? 0, 0);
    const endLineText = document.lineAt(Math.min(instr?.endLine ?? 0, document.lineCount - 1));
    const end = new vscode.Position(instr.endLine ?? 0, endLineText.text.length);

    switch (instr.insertMode) {
      case 'insertBefore':
        edit.insert(uri, start, instr.content || '');
        break;
      case 'insertAfter':
        edit.insert(uri, end.translate(1, 0), instr.content || '');
        break;
      default:
        edit.replace(uri, new vscode.Range(start, end), instr.content || '');
        break;
    }

    await vscode.workspace.applyEdit(edit);
    await document.save();
  }

  private async renameFile(oldPath: string, newPath: string, root: string) {
    const oldUri = resolveFilePath(oldPath, root);
    const newUri = resolveFilePath(newPath, root);
    await this.ensureDirectory(newUri);
    await vscode.workspace.fs.rename(oldUri, newUri, { overwrite: true });
  }

  private async deleteFile(path: string, root: string) {
    const uri = resolveFilePath(path, root);

    await vscode.workspace.fs.delete(uri);
  }

  private async ensureDirectory(fileUri: vscode.Uri) {
    const dirUri = vscode.Uri.file(path.dirname(fileUri.fsPath));
    try {
      await vscode.workspace.fs.stat(dirUri);
    } catch {
      await vscode.workspace.fs.createDirectory(dirUri);
    }
  }

  async executeCommand(command: string, root: string) {
    try {
      if (!vscode.workspace.workspaceFolders?.length) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return;
      }

      return execSync(command, { cwd: root, encoding: 'utf-8' });
    } catch (err: any) {
      vscode.window.showErrorMessage(`Failed to execute command: ${command}`);
      return err.message;
    }
  }

  async processInstruction(instructions: AgentInstruction[]) {
    if (!vscode.workspace.workspaceFolders?.length) return instructions;
    const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const results: AgentInstruction[] = [];

    for (const instruction of instructions) {
      let result = instruction;

      if (instruction.action === AGENT_ACTIONS.renameFile && instruction.newName) {
        await this.renameFile(instruction.file, instruction.newName, root);
      } else if (instruction.action === AGENT_ACTIONS.deleteFile) {
        await this.deleteFile(instruction.file, root);
      } else if (
        [AGENT_ACTIONS.createFile, AGENT_ACTIONS.updateFile].includes(instruction.action)
      ) {
        await this.createOrUpdateFile(instruction, root);
      } else if (instruction.action === AGENT_ACTIONS.executeCommand) {
        const executedResponse = await this.executeCommand(instruction.content, root);
        result = { ...instruction, executedResponse };
      }

      results.push(result);
    }
    return results;
  }
}
