import * as vscode from 'vscode';

import { AiConfigT, COMMANDS, CONFIG_PARAGRAPH, MESSAGE } from './types';

const DEFAULT_AI_CONFIG = {
  endpoint: 'http://localhost:11434',
  maxTokens: 512,
  temperature: 0.2,
};

class Configuration {
  private config = vscode.workspace.getConfiguration();

  get chatConfig() {
    return this.config.get(CONFIG_PARAGRAPH.chatConfig, { ...DEFAULT_AI_CONFIG }) as AiConfigT;
  }

  get autoCompleteConfig() {
    return this.config.get(CONFIG_PARAGRAPH.autoCompleteConfig, {
      ...DEFAULT_AI_CONFIG,
    }) as AiConfigT;
  }

  async updateChatConfig(data: AiConfigT) {
    const promises = Object.entries(data).map(([key, value]) => {
      return this.config.update(
        `${CONFIG_PARAGRAPH.chatConfig}.${key}`,
        value,
        vscode.ConfigurationTarget.Global,
      );
    });
    return Promise.all(promises);
  }

  async updateAutoCompleteConfig(data: AiConfigT) {
    const promises = Object.entries(data).map(([key, value]) => {
      return this.config.update(
        `${CONFIG_PARAGRAPH.autoCompleteConfig}.${key}`,
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
        return this.updateChatConfig(value);
      }

      if (key === CONFIG_PARAGRAPH.autoCompleteConfig) {
        return this.updateAutoCompleteConfig(value);
      }
    }
  }
}

export const Conf = new Configuration();
