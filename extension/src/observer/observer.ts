/* eslint-disable @typescript-eslint/no-explicit-any */

type Listener = (...args: any) => void;

export class PubSub {
  private listeners: { [key: string]: Listener[] } = {};

  subscribe(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, payload: any): void {
    this.listeners[event]?.forEach((listener) => listener(payload));
  }

  unsubscribe(event: string, listener: Listener) {
    const listeners = this.listeners[event];
    if (!listeners) return;

    this.listeners[event] = listeners.filter((l) => l !== listener);
    if (this.listeners[event].length === 0) {
      delete this.listeners[event];
    }
  }
}
