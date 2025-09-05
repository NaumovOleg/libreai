import { useState, useEffect, type FC, type ReactElement } from 'react';
import { ConfigContext } from './context';
import { ChatConfig, CONFIG_PARAGRAPH, COMMANDS } from '@utils';

const vscode = acquireVsCodeApi();

export const ConfigProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [chatSettings, setChatSettings] = useState<ChatConfig>({
    provider: 'ollama',
    model: '',
    endpoint: '',
    apiKey: '',
    maxTokens: 500,
    temperature: 0.2,
  });

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data.type === CONFIG_PARAGRAPH.chatConfig) {
        setChatSettings(event.data.payload as ChatConfig);
      }
    });
  }, []);

  const setChatConfig = (conf: Partial<ChatConfig>) => {
    setChatSettings((prev) => prev && { ...prev, ...conf });
  };

  const applyChanges = () => {
    vscode.postMessage({
      command: COMMANDS.changeConfig,
      key: CONFIG_PARAGRAPH.chatConfig,
      value: chatSettings,
    });
  };

  return (
    <ConfigContext.Provider
      value={{ [CONFIG_PARAGRAPH.chatConfig]: chatSettings, setChatConfig, applyChanges }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
