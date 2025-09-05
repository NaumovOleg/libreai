import * as vscode from 'vscode';

import { ChatConfig, COMMANDS, CONFIG_PARAGRAPH, MESSAGE } from './types';

const DEFAULT_AI_CONFIG = {
  endpoint: 'http://localhost:11434',
  apiKey: '',
  maxTokens: 512,
  temperature: 0.2,
  model: 'qwen2.5-coder:3b',
};

class Configuration {
  private config = vscode.workspace.getConfiguration();

  get chatConfig() {
    return this.config.get(CONFIG_PARAGRAPH.chatConfig, DEFAULT_AI_CONFIG) as ChatConfig;
  }

  async updateAi(data: ChatConfig) {
    const promises = Object.entries(data).map(([key, value]) => {
      return this.config.update(
        `${CONFIG_PARAGRAPH.chatConfig}.${key}`,
        value,
        vscode.ConfigurationTarget.Global,
      );
    });
    return Promise.all(promises);
  }

  async updateConfig(message: MESSAGE) {
    if (message.command === COMMANDS.changeConfig) {
      const { key, value } = message;
      if (key === CONFIG_PARAGRAPH.chatConfig) {
        return this.updateAi(value);
      }
    }
  }
}

export const Conf = new Configuration();
