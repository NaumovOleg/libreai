import axios from 'axios';
import * as vscode from 'vscode';

import { AIConfig, PromptMessages } from '../utils';

export class AIClient {
  private cfg: AIConfig;

  constructor(cfg: AIConfig) {
    this.cfg = cfg;
  }

  static fromSettings(): AIClient {
    const s = vscode.workspace.getConfiguration();
    const provider = s.get<string>('libreChat.provider', 'ollama') as AIConfig['provider'];
    const endpoint = s.get<string>('libreChat.endpoint', 'http://localhost:11434');
    const apiKey = s.get<string>('libreChat.apiKey', '');
    const model = s.get<string>('libreChat.model', 'qwen2.5-coder:3b');
    const maxTokens = s.get<number>('libreChat.maxTokens', 512);
    const temperature = s.get<number>('libreChat.temperature', 0.2);
    return new AIClient({
      provider,
      endpoint,
      apiKey,
      model,
      maxTokens,
      temperature,
    });
  }

  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    if (this.cfg.provider === 'ollama') return this.chatOllama(messages);
    return this.chatOpenAI(messages);
  }

  async triggerSuggestions(messages: PromptMessages): Promise<string> {
    if (this.cfg.provider === 'ollama') return this.triggerSuggestionsOllama(messages);
    return this.chatOpenAI(messages);
  }

  async *streamChat(
    messages: Array<{ role: string; content: string }>,
  ): AsyncGenerator<string, void, unknown> {
    if (this.cfg.provider === 'ollama') {
      yield* this.streamOllama(messages);
    } else {
      yield* this.streamOpenAI(messages);
    }
  }

  private async triggerSuggestionsOllama(
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    const url = this.cfg.endpoint.replace(/\/$/, '') + '/api/chat';

    const body = JSON.stringify({
      model: this.cfg.model,
      messages,
      stream: false,
      options: {
        temperature: this.cfg.temperature,
        num_predict: this.cfg.maxTokens,
      },
    });

    console.log(body);

    const headers = { 'Content-Type': 'application/json' };
    const { data } = await axios.post(url, body, { headers });

    console.log(data);

    return data?.message?.content || data?.response || '';
  }

  private async chatOllama(messages: Array<{ role: string; content: string }>): Promise<string> {
    const url = this.cfg.endpoint.replace(/\/$/, '') + '/api/generate';
    const body = JSON.stringify({
      model: this.cfg.model,
      messages,
      options: {
        temperature: this.cfg.temperature,
        num_predict: this.cfg.maxTokens,
      },
    });

    const res = await axios.post(url, {
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    console.log(res.data);

    const data = res.data;
    return data?.message?.content || data?.response || '';
  }

  /** OpenAI чат */
  private async chatOpenAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    const url = this.cfg.endpoint.replace(/\/$/, '') + '/chat/completions';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.cfg.apiKey) headers['Authorization'] = `Bearer ${this.cfg.apiKey}`;

    const body = JSON.stringify({
      model: this.cfg.model,
      messages,
      temperature: this.cfg.temperature,
      max_tokens: this.cfg.maxTokens,
    });

    const res = await fetch(url, { method: 'POST', headers, body });
    if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);

    const data = (await res.json()) as any;
    return data?.choices?.[0]?.message?.content || '';
  }

  /** Стриминг для OpenAI */
  private async *streamOpenAI(
    messages: Array<{ role: string; content: string }>,
  ): AsyncGenerator<string, void, unknown> {
    const url = this.cfg.endpoint.replace(/\/$/, '') + '/chat/completions';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.cfg.apiKey) headers['Authorization'] = `Bearer ${this.cfg.apiKey}`;

    const body = JSON.stringify({
      model: this.cfg.model,
      messages,
      temperature: this.cfg.temperature,
      max_tokens: this.cfg.maxTokens,
      stream: true,
    });

    const res = await fetch(url, { method: 'POST', headers, body });
    if (!res.ok || !res.body)
      throw new Error(`OpenAI stream error: ${res.status} ${await res.text()}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n');
      for (let i = 0; i < parts.length - 1; i++) {
        const line = parts[i].trim();
        if (!line || !line.startsWith('data:')) continue;
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
      buffer = parts[parts.length - 1];
    }
  }

  /** Стриминг для Ollama */
  private async *streamOllama(
    messages: Array<{ role: string; content: string }>,
  ): AsyncGenerator<string, void, unknown> {
    const url = this.cfg.endpoint.replace(/\/$/, '') + '/api/chat?stream=true';
    const body = JSON.stringify({
      model: this.cfg.model,
      messages,
      options: {
        temperature: this.cfg.temperature,
        num_predict: this.cfg.maxTokens,
      },
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok || !res.body)
      throw new Error(`Ollama stream error: ${res.status} ${await res.text()}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n');
      for (let i = 0; i < parts.length - 1; i++) {
        const line = parts[i].trim();
        if (!line) continue;
        try {
          const parsed = JSON.parse(line);
          const msg = parsed?.message?.content || parsed?.response || '';
          if (msg) yield msg;
        } catch {
          yield line;
        }
      }
      buffer = parts[parts.length - 1];
    }
  }
}
