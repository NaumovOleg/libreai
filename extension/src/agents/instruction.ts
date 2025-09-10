import { execSync } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

import { AIClient } from '../clients';
import { AGENT_ACTIONS, AGENT_PROMPT, AgentInstruction } from '../utils';

export class AIAgent {
  constructor(private aiClient: AIClient) {}

  private parseAIResponse(raw: string): AgentInstruction[] {
    const cleaned = raw
      .replace(/```(?:json)?/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return Array.isArray(parsed) ? parsed : [parsed];
  }

  private resolveFilePath(filePath: string, root: string): vscode.Uri {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
    return vscode.Uri.file(absolutePath);
  }

  async run(data: {
    userPrompt: string;
    history: string[];
    selection: string;
    currentFilePath: string;
    workspaceContext: string;
    language?: string;
  }) {
    if (!vscode.workspace.workspaceFolders?.length) return;

    const messages = AGENT_PROMPT({
      workspaceContext: data.workspaceContext,
      selection: data.selection,
      currentFilePath: data.currentFilePath,
      userPrompt: data.userPrompt,
      history: data.history,
      language: data.language,
    });
    console.log('PROMPT_MESSAGES++++++++++++++++++', messages);
    let aiResponse = '';
    for await (const chunk of this.aiClient.chat(messages)) {
      aiResponse += chunk;
    }

    console.log('AI RESPONSE++++++++++++++', aiResponse);
    try {
      const instruction = this.parseAIResponse(aiResponse);
      return instruction;
    } catch (err) {
      vscode.window.showErrorMessage('AI Agent failed to parse AI response');
      console.error('Parsing Error:', err, '\nRaw Response:', aiResponse);
    }
  }

  private async createOrUpdateFile(instr: AgentInstruction, root: string) {
    const uri = this.resolveFilePath(instr.file, root);
    await this.ensureDirectory(uri);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(instr.content || '', 'utf-8'));
  }

  private async renameFile(oldPath: string, newPath: string, root: string) {
    const oldUri = this.resolveFilePath(oldPath, root);
    const newUri = this.resolveFilePath(newPath, root);
    await this.ensureDirectory(newUri);
    await vscode.workspace.fs.rename(oldUri, newUri, { overwrite: true });
  }

  private async deleteFile(path: string, root: string) {
    const uri = this.resolveFilePath(path, root);

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
    } catch (err) {
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
