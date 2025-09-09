import { useState, useEffect, type FC, type ReactElement } from 'react';
import { ConfigContext } from './context';
import { AiConfigT, CONFIG_PARAGRAPH, COMMANDS, vscode, globalListener } from '@utils';

const defaultData = {
  endpoint: 'http://localhost:11434',
  maxTokens: 500,
  temperature: 0.2,
} as AiConfigT;

export const ConfigProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [chatSettings, setChatSettings] = useState<AiConfigT>({ ...defaultData });
  const [autocompleteSettings, setAutocompleteSettings] = useState<AiConfigT>({ ...defaultData });

  const setConfig = (type: CONFIG_PARAGRAPH, conf: Partial<AiConfigT>) => {
    if (type === CONFIG_PARAGRAPH.chatConfig) {
      setChatSettings((prev) => prev && { ...prev, ...conf });
    }
    if (type === CONFIG_PARAGRAPH.autoCompleteConfig) {
      setAutocompleteSettings((prev) => prev && { ...prev, ...conf });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler = (event: MessageEvent<any>) => {
    if (event.data.type === COMMANDS.changeConfig) {
      setConfig(
        CONFIG_PARAGRAPH.chatConfig,
        event.data.payload[CONFIG_PARAGRAPH.chatConfig] as AiConfigT,
      );
      setConfig(
        CONFIG_PARAGRAPH.autoCompleteConfig,
        event.data.payload[CONFIG_PARAGRAPH.autoCompleteConfig] as AiConfigT,
      );
    }
  };

  useEffect(() => {
    vscode.postMessage({ command: COMMANDS.configListenerMounted });

    globalListener.subscribe([COMMANDS.changeConfig], handler);
    return () => {
      globalListener.unsubscribe([COMMANDS.changeConfig], handler);
    };
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
