import * as vscode from 'vscode';

import { COMMANDS, EDITOR_EVENTS } from '../../../global.types';
import { Observer } from './observer';
import { Handler, Payloads } from './types';

export class EditorObserver {
  observer = new Observer();
  private static instance: EditorObserver;
  web!: vscode.WebviewView;

  init(web: vscode.WebviewView) {
    this.web = web;
    if (!EditorObserver.instance) {
      EditorObserver.instance = new EditorObserver();
    }
    return this.observe();
  }

  static getInstance(): EditorObserver {
    return EditorObserver.instance;
  }

  emit(event: EDITOR_EVENTS, payload: Payloads<EDITOR_EVENTS>) {
    this.observer.emit(event, payload);
  }

  observe() {
    this.observer.subscribe(EDITOR_EVENTS.readFile, this.readFile.bind(this));
    this.observer.subscribe(EDITOR_EVENTS.renameFile, this.renameFile.bind(this));
    this.observer.subscribe(EDITOR_EVENTS.deleteFile, this.deleteFile.bind(this));
    this.observer.subscribe(EDITOR_EVENTS.editFile, this.editFile.bind(this));
    this.observer.subscribe(EDITOR_EVENTS.createFile, this.createFile.bind(this));
    this.observer.subscribe(EDITOR_EVENTS.command, this.command.bind(this));
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
}
