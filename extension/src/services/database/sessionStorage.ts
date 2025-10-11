import * as vscode from 'vscode';

import { CHAT_HISTORY, CHAT_HISTORY_PROP, ChatMessage } from '../../utils';

export class SessionStorage {
  private _chatHistory: CHAT_HISTORY;
  private historyLimit = 10;

  constructor(private context: vscode.ExtensionContext) {
    const history = context.globalState.get<CHAT_HISTORY>(CHAT_HISTORY_PROP, []);
    this._chatHistory = history ?? [];
  }

  async addChatHistoryItems(message: ChatMessage[]) {
    message.forEach((message) => {
      if (this._chatHistory.length > this.historyLimit) {
        this._chatHistory.shift();
      }

      this._chatHistory.push(`From: ${message.from}. Content: ${message.text}`);
    });

    return this.context.globalState.update(CHAT_HISTORY_PROP, this._chatHistory);
  }

  get history() {
    return this._chatHistory;
  }

  clear() {
    this._chatHistory = [];
    return this.context.globalState.update(CHAT_HISTORY_PROP, []);
  }
}
