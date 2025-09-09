import { useState, useEffect, type FC, type ReactElement } from 'react';
import { ListenerContext } from './context';
import { AiConfigT, CONFIG_PARAGRAPH, COMMANDS, vscode } from '@utils';

const defaultData = {
  endpoint: 'http://localhost:11434',
  maxTokens: 500,
  temperature: 0.2,
} as AiConfigT;

export const ListenerProvider: FC<{ children: ReactElement }> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [event, setEvent] = useState<{ command: COMMANDS; value: any } | undefined>();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (event: MessageEvent<any>) => {
      setEvent({
        command: event.data.type as COMMANDS,
        value: event.data.payload,
      });
    };
    window.addEventListener('message', handler);
    vscode.postMessage({ command: COMMANDS.configListenerMounted });
    return () => {
      window.addEventListener('message', handler);
    };
  }, []);

  return <ListenerContext.Provider value={event}>{children}</ListenerContext.Provider>;
};
