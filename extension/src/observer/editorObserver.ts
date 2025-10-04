import * as vscode from 'vscode';

import {
  AgentMessagePayload,
  COMMANDS,
  EDITOR_EVENTS,
  EditorObserverEventArgs,
  EditorObserverHandler,
} from '../../../global.types';
import { Observer } from './observer';

export class EditorObserver {
  observer = new Observer();
  private static instance: EditorObserver;
  web!: vscode.WebviewView;

  private constructor() {}

  static getInstance(): EditorObserver {
    if (!EditorObserver.instance) {
      EditorObserver.instance = new EditorObserver();
    }
    return EditorObserver.instance;
  }

  init(web: vscode.WebviewView) {
    this.web = web;
    this.observe();
  }

  emit<E extends keyof EditorObserverEventArgs>(
    event: E,
    payload: Omit<AgentMessagePayload<E>, 'type'>,
  ) {
    this.observer.emit(event, payload);
  }

  observe() {
    this.observer.subscribe(EDITOR_EVENTS.readFile, this.readFile);
    this.observer.subscribe(EDITOR_EVENTS.renameFile, this.renameFile.bind(this));
    this.observer.subscribe(EDITOR_EVENTS.deleteFile, this.deleteFile.bind(this));
    this.observer.subscribe(EDITOR_EVENTS.editFile, this.editFile);
    this.observer.subscribe(EDITOR_EVENTS.createFile, this.createFile.bind(this));
    this.observer.subscribe(EDITOR_EVENTS.command, this.command.bind(this));
    this.observer.subscribe(EDITOR_EVENTS.planning, this.planning.bind(this));
    this.observer.subscribe(EDITOR_EVENTS.agentResponse, this.agentResponse.bind(this));
  }
  readFile: EditorObserverHandler<EDITOR_EVENTS.readFile> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.readFile };
    this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  };
  agentResponse: EditorObserverHandler<EDITOR_EVENTS.agentResponse> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.agentResponse };
    this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  };
  renameFile: EditorObserverHandler<EDITOR_EVENTS.renameFile> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.renameFile };
    this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  };
  deleteFile: EditorObserverHandler<EDITOR_EVENTS.deleteFile> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.deleteFile };
    this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  };
  editFile: EditorObserverHandler<EDITOR_EVENTS.editFile> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.editFile };
    this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  };
  createFile: EditorObserverHandler<EDITOR_EVENTS.createFile> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.createFile };
    this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  };
  command: EditorObserverHandler<EDITOR_EVENTS.command> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.command };
    this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  };
  planning: EditorObserverHandler<EDITOR_EVENTS.command> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.planning };
    this.web.webview.postMessage({ type: COMMANDS.agentResponse, payload });
  };
}
