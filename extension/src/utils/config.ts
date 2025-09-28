import * as vscode from 'vscode';

import { AiConfigT, CONFIG_PARAGRAPH, MESSAGE } from './types';

const DEFAULT_AI_CONFIG = {
  maxTokens: 512,
  temperature: 0.2,
};

class Configuration {
  private config = vscode.workspace.getConfiguration();

  get chatConfig() {
    return this.config.get(CONFIG_PARAGRAPH.chatConfig, DEFAULT_AI_CONFIG) as AiConfigT;
  }

  get autoCompleteConfig() {
    return this.config.get(CONFIG_PARAGRAPH.autoCompleteConfig, DEFAULT_AI_CONFIG) as AiConfigT;
  }

  get agentConfig() {
    return this.config.get(CONFIG_PARAGRAPH.agentConfig, DEFAULT_AI_CONFIG) as AiConfigT;
  }

  async updateAgentConfig(data: AiConfigT) {
    const promises = Object.entries(data).map(([key, value]) => {
      return this.config.update(
        `${CONFIG_PARAGRAPH.agentConfig}.${key}`,
        value,
        vscode.ConfigurationTarget.Global,
      );
    });
    return Promise.all(promises);
  }

  async updateChatConfig(data: AiConfigT) {
    console.log(data);
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
    const { key, value } = message;
    if (key === CONFIG_PARAGRAPH.chatConfig) {
      return this.updateChatConfig(value as AiConfigT);
    }
    if (key === CONFIG_PARAGRAPH.autoCompleteConfig) {
      return this.updateAutoCompleteConfig(value as AiConfigT);
    }
    if (key === CONFIG_PARAGRAPH.agentConfig) {
      return this.updateAgentConfig(value as AiConfigT);
    }
  }
}

export const Conf = new Configuration();
