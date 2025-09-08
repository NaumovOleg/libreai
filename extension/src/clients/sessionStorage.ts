import * as vscode from 'vscode';

import { CHAT_HISTORY, CHAT_HISTORY_PROP, ChatMessage } from '../utils';

export class SessionStorage {
  private chatHistory: CHAT_HISTORY;
  private historyLimit = 10;

  constructor(private context: vscode.ExtensionContext) {
    this.chatHistory = context.globalState.get<CHAT_HISTORY>(CHAT_HISTORY_PROP, []);
  }

  async addChatHistoryItems(message: ChatMessage[]) {
    message.forEach((message) => {
      if (!this.chatHistory[message.session]) {
        this.chatHistory[message.session] = [];
      }
      if (this.chatHistory[message.session].length > this.historyLimit) {
        this.chatHistory[message.session].shift();
      }
      const content = message.instruction ? JSON.stringify(message.instruction) : message.text;
      const text = `From: ${message.from}. Content: ${content}`;
      this.chatHistory[message.session].push(text);
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
