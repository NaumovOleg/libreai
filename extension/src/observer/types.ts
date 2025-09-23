import { EDITOR_EVENTS } from '../../../global.types';

export type EventArgs = {
  [EDITOR_EVENTS.readFile]: string;
  [EDITOR_EVENTS.renameFile]: { file: string; newName: string };
  [EDITOR_EVENTS.editFile]: { file: string; content: string };
  [EDITOR_EVENTS.deleteFile]: string;
  [EDITOR_EVENTS.createFile]: string;
  [EDITOR_EVENTS.command]: string;
  [EDITOR_EVENTS.planning]: string;
};

export type Status = 'pending' | 'done' | 'error';

export type Payloads<E extends keyof EventArgs> = {
  type?: E;
  status: Status;
  id: string;
  args: EventArgs[E];
};

export type Handler<E extends keyof EventArgs> = (payload: Payloads<E>) => void;

export type Handlers =
  | Handler<EDITOR_EVENTS.readFile>
  | Handler<EDITOR_EVENTS.renameFile>
  | Handler<EDITOR_EVENTS.createFile>
  | Handler<EDITOR_EVENTS.editFile>
  | Handler<EDITOR_EVENTS.command>
  | Handler<EDITOR_EVENTS.deleteFile>;

export type Listener<E extends EDITOR_EVENTS> = Handler<E>;
