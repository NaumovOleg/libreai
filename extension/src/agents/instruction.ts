import * as path from 'path';
import * as vscode from 'vscode';

import { AIClient } from '../clients';
import { AGENT_PROMPT, AgentInstruction, FILE_ACTIONS } from '../utils';

export class AIAgent {
  constructor(private aiClient: AIClient) {}

  private parseAIResponse(raw: string): AgentInstruction {
    const cleaned = raw
      .replace(/```(?:json)?/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleaned);
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
  }) {
    if (!vscode.workspace.workspaceFolders?.length) return;

    const messages = AGENT_PROMPT({
      workspaceContext: data.workspaceContext,
      selection: data.selection,
      currentFilePath: data.currentFilePath,
      userPrompt: data.userPrompt,
      history: data.history,
    });
    let aiResponse = '';
    for await (const chunk of this.aiClient.chat(messages)) {
      aiResponse += chunk;
    }
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

  private async ensureDirectory(fileUri: vscode.Uri) {
    const dirUri = vscode.Uri.file(path.dirname(fileUri.fsPath));
    try {
      await vscode.workspace.fs.stat(dirUri);
    } catch {
      await vscode.workspace.fs.createDirectory(dirUri);
    }
  }

  async processInstruction(instruction: AgentInstruction) {
    if (!vscode.workspace.workspaceFolders?.length) return;
    const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
    if (instruction.action === FILE_ACTIONS.renameFile && instruction.newName) {
      await this.renameFile(instruction.file, instruction.newName, root);
    } else {
      await this.createOrUpdateFile(instruction, root);
    }
  }
}
