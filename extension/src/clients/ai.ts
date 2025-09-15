import axios from 'axios';

import { Conf, PromptMessages } from '../utils';

type Role = 'system' | 'user' | 'assistant';
type Message = { role: Role; content: string };

export class AIClient {
  private cfg = Conf.chatConfig;
  private acfg = Conf.autoCompleteConfig;
  private endpoints = {
    chat: {
      ollama: '/chat/completions',
      openai: '/chat/completions',
      openrouter: '/api/v1/chat/completions',
      deepseek: '/api/v1/chat/completions',
    },
    autocomplete: {
      ollama: '/api/chat',
      openai: '/chat/completions',
      openrouter: '/api/v1/chat/completions',
      deepseek: '/api/v1/chat/completions',
    },
  };

  /** =========================
   *  AUTOCOMPLETE (stream: false)
   *  ========================= */
  async autocomplete(messages: PromptMessages): Promise<string> {
    if (this.acfg.provider === 'ollama') return this.reqOllama(messages, false);
    if (this.acfg.provider === 'openrouter') return this.openRouter(messages, false);
    return this.reqOpenAI(messages, false);
  }

  private async openRouter(messages: Message[], stream: boolean): Promise<string> {
    const url = this.cfg.endpoint.replace(/\/$/, '') + '/api/v1/chat/completions';
    const body = {
      model: this.cfg.model,
      messages,
      stream,
      options: { temperature: this.cfg.temperature, num_predict: this.cfg.maxTokens },
    };

    const { data } = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.cfg.apiKey}` },
    });

    return data?.message?.content || data?.response || '';
  }

  /** =========================
   *  CHAT (stream: true)
   *  ========================= */
  async *chat(messages: Message[]): AsyncGenerator<string, void, unknown> {
    yield* this.reqStream(messages);
  }

  private async *reqStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    const chatConfig = Conf.chatConfig;
    const api = this.endpoints.chat?.[chatConfig.provider];
    const url = this.cfg.endpoint.replace(/\/$/, '') + api;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (chatConfig.apiKey) headers['Authorization'] = `Bearer ${this.cfg.apiKey}`;

    const body = JSON.stringify({
      model: chatConfig.model,
      messages,
      temperature: chatConfig.temperature,
      max_tokens: chatConfig.maxTokens,
      stream: true,
    });

    const res = await fetch(url, { method: 'POST', headers, body });
    if (!res.ok || !res.body) throw new Error(`AI stream error: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line.startsWith('data:')) continue;
        const json = line.replace(/^data:\s*/, '');
        if (json === '[DONE]') return;
        try {
          const parsed = JSON.parse(json);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) yield delta;
        } catch {
          yield json;
        }
      }
      buffer = lines[lines.length - 1];
    }
  }

  /** -------------------------
   *  OLLAMA REQUEST (no stream)
   *  ------------------------- */
  private async reqOllama(messages: Message[], stream: boolean): Promise<string> {
    const url = this.cfg.endpoint.replace(/\/$/, '') + '/api/chat';
    const body = {
      model: this.cfg.model,
      messages,
      stream,
      options: { temperature: this.cfg.temperature, num_predict: this.cfg.maxTokens },
    };

    const { data } = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return data?.message?.content || data?.response || '';
  }

  /** -------------------------
   *  OLLAMA STREAMING CHAT
   *  ------------------------- */
  private async *reqOllamaStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    const url = this.cfg.endpoint.replace(/\/$/, '') + '/api/chat?stream=true';
    const body = JSON.stringify({
      model: this.cfg.model,
      messages,
      options: { temperature: this.cfg.temperature },
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok || !res.body) throw new Error(`Ollama stream error: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        try {
          const parsed = JSON.parse(line);
          const msg = parsed?.message?.content || parsed?.response || '';
          if (msg) yield msg;
        } catch {
          yield line;
        }
      }
      buffer = lines[lines.length - 1];
    }
  }

  /** -------------------------
   *  OPENAI REQUEST (no stream)
   *  ------------------------- */
  private async reqOpenAI(messages: Message[], stream: boolean): Promise<string> {
    const url = this.cfg.endpoint.replace(/\/$/, '') + '/chat/completions';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.cfg.apiKey) headers['Authorization'] = `Bearer ${this.cfg.apiKey}`;

    const body = {
      model: this.cfg.model,
      messages,
      temperature: this.cfg.temperature,
      max_tokens: this.cfg.maxTokens,
      stream,
    };

    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }
}
