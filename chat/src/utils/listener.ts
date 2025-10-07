import { COMMANDS } from './types';

class GlobalListener {
  messages: string[] = [];
  subscribers: { [key in COMMANDS]?: ((event: MessageEvent) => void)[] } = {};

  constructor() {
    window.addEventListener('message', (event: MessageEvent) => {
      console.log(event.data);
      const type = event.data.type as COMMANDS;
      this.subscribers[type]?.forEach((fn) => fn(event));
    });
  }

  subscribe(commands: COMMANDS[], fn: (event: MessageEvent) => void) {
    commands.forEach((cmd) => {
      if (!this.subscribers[cmd]) this.subscribers[cmd] = [];
      this.subscribers[cmd]!.push(fn);
    });
  }

  unsubscribe(commands: COMMANDS[], fn: (event: MessageEvent) => void) {
    commands.forEach((cmd) => {
      if (!this.subscribers[cmd]) return;
      this.subscribers[cmd] = this.subscribers[cmd]!.filter((f) => f !== fn);
      if (this.subscribers[cmd]!.length === 0) {
        delete this.subscribers[cmd];
      }
    });
  }
}

export const globalListener = new GlobalListener();
