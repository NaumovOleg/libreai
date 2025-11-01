/* eslint-disable @typescript-eslint/no-explicit-any */
import * as vscode from 'vscode';

import {
  AgentMessage,
  ChatMessage,
  COMMANDS,
  ExecCommandPayload,
  IndexingPayload,
} from '../../../global.types';
import { AgentSession } from './../services/agent.session';
import { PubSub } from './observer';

export class Observer {
  observer = new PubSub();
  private static instance: Observer;
  web!: vscode.WebviewView;

  private constructor() {}

  static getInstance(): Observer {
    if (!Observer.instance) {
      Observer.instance = new Observer();
    }
    return Observer.instance;
  }

  init(web: vscode.WebviewView) {
    this.web = web;
    this.observe();
  }

  emit(event: 'agent', payload: AgentMessage): void;
  emit(event: 'indexing', payload: IndexingPayload): void;
  emit(event: `interact-command-${string}`, payload: ExecCommandPayload): void;
  emit(event: COMMANDS.helperMessage, payload: ChatMessage): void;
  emit(event: COMMANDS.chatStream, payload: ChatMessage): void;
  emit(event: COMMANDS.restoreAgentSession): void;
  emit(event: COMMANDS.chatStreamEnd): void;
  emit(event: COMMANDS.onChangeWorkspace, payload: { [key: string]: IndexingPayload }): void;

  emit(event: any, payload?: any) {
    this.observer.emit(event, payload);
  }

  subscribe(event: string, listener: (...args: any) => void) {
    this.observer.subscribe(event, listener);
  }

  unsubscribe(event: string, listener: (...args: any) => void) {
    this.observer.unsubscribe(event, listener);
  }

  observe() {
    this.observer.subscribe('agent', this.agentResponse.bind(this));
    this.observer.subscribe('indexing', this.indexing.bind(this));
    this.observer.subscribe(COMMANDS.helperMessage, this.helperMessage.bind(this));
    this.observer.subscribe(COMMANDS.chatStream, this.chatStream.bind(this));
    this.observer.subscribe(COMMANDS.chatStreamEnd, this.chatStreamEnd.bind(this));
    this.observer.subscribe(COMMANDS.onChangeWorkspace, this.onChangeWorkspace.bind(this));
    this.observer.subscribe(COMMANDS.restoreAgentSession, this.restoreAgentSession.bind(this));
  }

  async agentResponse(payload: AgentMessage) {
    const agentSession = AgentSession.getInstance();
    await agentSession.saveMessage(payload);

    this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  }

  restoreAgentSession() {
    const agentSession = AgentSession.getInstance();
    const messages = agentSession.getMessages();
    this.web.webview.postMessage({ type: COMMANDS.restoreAgentSession, payload: messages });
  }

  indexing = (payload: IndexingPayload) => {
    this.web.webview.postMessage({ type: COMMANDS.indexing, payload });
  };
  helperMessage = (payload: ChatMessage) => {
    this.web.webview.postMessage({ type: COMMANDS.helperMessage, payload });
  };

  chatStream(payload: ChatMessage) {
    this.web.webview.postMessage({ type: COMMANDS.chatStream, payload });
  }

  chatStreamEnd() {
    this.web.webview.postMessage({ type: COMMANDS.chatStreamEnd });
  }
  onChangeWorkspace(payload: { [key: string]: IndexingPayload }) {
    this.web.webview.postMessage({ type: COMMANDS.onChangeWorkspace, payload });
  }
}
