export type Provider = "openai" | "ollama";

export interface AIConfig {
  provider: Provider;
  endpoint: string;
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}
