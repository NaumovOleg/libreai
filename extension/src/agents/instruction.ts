import * as path from 'path';
import * as vscode from 'vscode';

import { AIClient } from '../clients';
import { AGENT_PROMPT, gatherWorkspaceContext } from '../utils';

interface AgentInstruction {
  action: 'updateFile' | 'createFile';
  file: string;
  content: string;
}

export class AIAgent {
  constructor(private aiClient: AIClient) {}

  private parseAIResponse(raw: string): AgentInstruction[] {
    // Strip all code fences like ```json ... ```
    const cleaned = raw
      .replace(/```(?:json)?/g, '')
      .replace(/```/g, '')
      .trim();
    console.log('Cleaned AI Response:', cleaned);
    return JSON.parse(cleaned);
  }

  private resolveFilePath(filePath: string, root: string): vscode.Uri {
    // Normalize AI-provided path
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
      console.log('Parsed Instructions:', instructions);

      // Markdown preview
      const markdown = instructions
        .map(
          (instr) =>
            `**${instr.action.toUpperCase()}**: ${instr.file}\n\n\`\`\`ts\n${instr.content}\n\`\`\``,
        )
        .join('\n\n');
      console.log('Markdown Preview:\n', markdown);

      // Write all files
      for (const instr of instructions) {
        const uri = this.resolveFilePath(instr.file, root);
        await this.ensureDirectory(uri);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(instr.content, 'utf-8'));
      }

      vscode.window.showInformationMessage(
        `AI Agent created/updated ${instructions.length} files.`,
      );
    } catch (err) {
      vscode.window.showErrorMessage('AI Agent failed to parse AI response');
      console.error('Parsing Error:', err, '\nRaw Response:', aiResponse);
    }
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
