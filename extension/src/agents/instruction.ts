import * as path from 'path';
import * as vscode from 'vscode';

import { AIClient } from '../clients';
import { AGENT_PROMPT, gatherWorkspaceContext } from '../utils';

interface AgentInstruction {
  action: 'updateFile' | 'createFile' | 'renameFile' | 'deleteFile';
  file: string;
  content?: string;
  newName?: string;
}

export class AIAgent {
  constructor(private aiClient: AIClient) {}

  private parseAIResponse(raw: string): AgentInstruction[] {
    const cleaned = raw
      .replace(/```(?:json)?/g, '')
      .replace(/```/g, '')
      .trim();

    console.log('Cleaned AI Response:', cleaned);
    return JSON.parse(cleaned);
  }

  private resolveFilePath(filePath: string, root: string): vscode.Uri {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
    return vscode.Uri.file(absolutePath);
  }

  async run(userPrompt: string) {
    if (!vscode.workspace.workspaceFolders?.length) return;
    const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const editor = vscode.window.activeTextEditor;

    const selection = editor?.document.getText(editor.selection) || '';
    const workspaceContext = await gatherWorkspaceContext(6, 6000);

    const messages = AGENT_PROMPT({
      workspaceContext,
      selection,
      currentFilePath: editor?.document.uri.fsPath || 'none',
      userPrompt,
    });

    let aiResponse = '';
    for await (const chunk of this.aiClient.chat(messages)) {
      aiResponse += chunk;
    }

    try {
      const instructions = this.parseAIResponse(aiResponse);

      for (const instr of instructions) {
        if (instr.action === 'renameFile' && instr.newName) {
          await this.renameFile(instr.file, instr.newName, root);
        } else {
          await this.createOrUpdateFile(instr, root);
        }
      }

      vscode.window.showInformationMessage(
        `AI Agent processed ${instructions.length} instructions.`,
      );
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
}
