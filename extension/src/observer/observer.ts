/* eslint-disable @typescript-eslint/no-explicit-any */

type Listener = (...args: any) => void;

export class Observer {
  private listeners: { [key: string]: Listener[] } = {};

  subscribe(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);

    return () => {
      this.listeners[event] = this.listeners[event]!.filter((l) => l !== listener);
    };
  }

  emit(event: string, payload: any): void {
    this.listeners[event]?.forEach((listener) => listener(event, payload));
  }
}
