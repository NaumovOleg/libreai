import * as vscode from 'vscode';

import { COMMANDS, EDITOR_EVENTS } from '../../../global.types';
import { Observer } from './observer';
import { EventArgs, Handler, Payloads } from './types';

export class EditorObserver {
  observer = new Observer();
  private static instance: EditorObserver;
  web!: vscode.WebviewView;

  private constructor() {} // private to prevent direct instantiation

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

  emit<E extends keyof EventArgs>(event: E, payload: Payloads<E>) {
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
  }
  readFile: Handler<EDITOR_EVENTS.readFile> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.readFile };
    this.web.webview.postMessage({ type: COMMANDS.editor, payload });
  };
  renameFile: Handler<EDITOR_EVENTS.renameFile> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.renameFile };
    this.web.webview.postMessage({ type: COMMANDS.editor, payload });
  };
  deleteFile: Handler<EDITOR_EVENTS.deleteFile> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.deleteFile };
    this.web.webview.postMessage({ type: COMMANDS.editor, payload });
  };
  editFile: Handler<EDITOR_EVENTS.editFile> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.editFile };
    this.web.webview.postMessage({ type: COMMANDS.editor, payload });
  };
  createFile: Handler<EDITOR_EVENTS.createFile> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.createFile };
    this.web.webview.postMessage({ type: COMMANDS.editor, payload });
  };
  command: Handler<EDITOR_EVENTS.command> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.command };
    this.web.webview.postMessage({ type: COMMANDS.editor, payload });
  };
  planning: Handler<EDITOR_EVENTS.command> = (data) => {
    const payload = { ...data, type: EDITOR_EVENTS.planning };
    this.web.webview.postMessage({ type: COMMANDS.editor, payload });
  };
}
