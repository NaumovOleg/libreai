import { AgentMessage, uuid } from '@utils';
import * as vscode from 'vscode';

export class AgentSession {
  private static _instance: AgentSession;
  private _session: string;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this._session = uuid(7);
  }

  static init(context: vscode.ExtensionContext): AgentSession {
    if (!AgentSession._instance && context) {
      AgentSession._instance = new AgentSession(context);
    }
    return AgentSession._instance;
  }

  static getInstance() {
    return AgentSession._instance;
  }

  get session() {
    return this._session;
  }

  reset() {
    this._session = uuid(7);
    return this.context.globalState.update(this._getSessionKey(), []);
  }

  async saveMessage(message: AgentMessage) {
    message.session = this._session;
    const messages = this.getMessages();

    const found = messages.find((el) => el.id === message.id);
    const newMessage = { ...found, ...message };

    const data = found
      ? messages.map((el) => (el.id === message.id ? newMessage : el))
      : messages.concat(newMessage);

    await this.context.globalState.update(this._getSessionKey(), data);

    return data;
  }

  getMessages() {
    const key = this._getSessionKey();

    return this.context.globalState.get<AgentMessage[]>(key, []);
  }

  private _getSessionKey(): string {
    return `agentSession.messages.${this._session}`;
  }
}
