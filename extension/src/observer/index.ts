/* eslint-disable @typescript-eslint/no-explicit-any */
import * as vscode from 'vscode';

import {
  AgentMessage,
  COMMANDS,
  EDITOR_EVENTS,
  ExecCommandPayload,
  IndexingPayload,
  ObserverEditorHandler,
} from '../../../global.types';
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

  emit(event: any, payload: any) {
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
  }
  agentResponse: ObserverEditorHandler<EDITOR_EVENTS.readFile> = (payload: AgentMessage) => {
    this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  };
  indexing = (payload: IndexingPayload) => {
    this.web.webview.postMessage({ type: COMMANDS.indexing, payload });
  };
}
