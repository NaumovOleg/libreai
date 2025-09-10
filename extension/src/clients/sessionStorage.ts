import * as vscode from 'vscode';

import { CHAT_HISTORY, CHAT_HISTORY_PROP, ChatMessage } from '../utils';

export class SessionStorage {
  private chatHistory: CHAT_HISTORY;
  private historyLimit = 10;

  constructor(private context: vscode.ExtensionContext) {
    const history = context.globalState.get<CHAT_HISTORY>(CHAT_HISTORY_PROP, {});
    this.chatHistory = history;
  }

  async addChatHistoryItems(message: ChatMessage[]) {
    message.forEach((message) => {
      if (!this.chatHistory[message.session]) {
        this.chatHistory[message.session] = [];
      }
      if (this.chatHistory[message.session].length > this.historyLimit) {
        this.chatHistory[message.session].shift();
      }

      let content = message.text;
      if (message.instructions?.length) {
        content = '';
        message.instructions.forEach((instruction, index) => {
          const paragraph = `${index}. Instruction id: ${instruction.id}.`;
          if (instruction.executedResponse) {
            content += paragraph + ` Execution response: ${instruction.executedResponse} \n`;
          } else {
            content += paragraph + ` Content: ${instruction.content} \n`;
          }
        });
      }

      this.chatHistory[message.session].push(`From: ${message.from}. Content: ${content}`);
    }, this.chatHistory);

    return this.context.globalState.update(CHAT_HISTORY_PROP, this.chatHistory);
  }

  removeSession(session: string) {
    delete this.chatHistory[session];
    return this.context.globalState.update(CHAT_HISTORY_PROP, this.chatHistory);
  }

  getSessionChatHistory(session: string) {
    return this.chatHistory[session] ?? [];
  }
}
