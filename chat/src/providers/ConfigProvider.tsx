import { useState, useEffect, type FC, type ReactElement } from 'react';
import { ConfigContext } from './context';
import { AiConfigT, CONFIG_PARAGRAPH, COMMANDS } from '@utils';

const vscode = acquireVsCodeApi();

const defaultData = {
  endpoint: 'http://localhost:11434',
  maxTokens: 500,
  temperature: 0.2,
} as AiConfigT;

export const ConfigProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [chatSettings, setChatSettings] = useState<AiConfigT>({ ...defaultData });
  const [autocompleteSettings, setAutocompleteSettings] = useState<AiConfigT>({ ...defaultData });

  const setConfig = (type: CONFIG_PARAGRAPH, conf: Partial<AiConfigT>) => {
    console.log('__________________', type, conf);

    if (type === CONFIG_PARAGRAPH.chatConfig) {
      setChatSettings((prev) => prev && { ...prev, ...conf });
    }
    if (type === CONFIG_PARAGRAPH.autoCompleteConfig) {
      setAutocompleteSettings((prev) => prev && { ...prev, ...conf });
    }
  };

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (
        [CONFIG_PARAGRAPH.autoCompleteConfig, CONFIG_PARAGRAPH.chatConfig].includes(event.data.type)
      ) {
        setConfig(event.data.type, event.data.payload as AiConfigT);
      }
    });
  }, []);

  const applyChanges = (key: CONFIG_PARAGRAPH) => {
    let value = chatSettings;
    if (key === CONFIG_PARAGRAPH.autoCompleteConfig) {
      value = autocompleteSettings;
    }
    const command = COMMANDS.changeConfig;
    vscode.postMessage({ key, value, command });
  };

  return (
    <ConfigContext.Provider
      value={{
        [CONFIG_PARAGRAPH.chatConfig]: chatSettings,
        [CONFIG_PARAGRAPH.autoCompleteConfig]: autocompleteSettings,
        setConfig,
        applyChanges,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
