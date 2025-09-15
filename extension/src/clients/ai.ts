import axios from 'axios';

import { Conf, PromptMessages } from '../utils';

type Role = 'system' | 'user' | 'assistant';
type Message = { role: Role; content: string };

export class AIClient {
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

  async autocomplete(messages: PromptMessages): Promise<string> {
    const config = Conf.autoCompleteConfig;
    const api = this.endpoints.autocomplete?.[config.provider];
    const url = config.endpoint.replace(/\/$/, '') + api;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

    const body = {
      model: config.model,
      messages,
      options: {
        temperature: config.temperature,
        num_predict: config.maxTokens,
      },
    };

    const { data } = await axios.post(url, body, { headers });
    return data?.message?.content || data?.response || '';
  }

  /** =========================
   *  CHAT (stream: true)
   *  ========================= */
  async *chat(messages: Message[]): AsyncGenerator<string, void, unknown> {
    yield* this.reqStream(messages);
  }

  private async *reqStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    const config = Conf.chatConfig;
    const api = this.endpoints.chat?.[config.provider];
    const url = config.endpoint.replace(/\/$/, '') + api;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

    const body = JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
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
}
