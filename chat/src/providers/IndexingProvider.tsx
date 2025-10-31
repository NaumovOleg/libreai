import { useState, type FC, type ReactElement, useEffect } from 'react';
import { IndexingContext } from './context';
import {
  COMMANDS,
  vscode,
  globalListener,
  IndexingMessage,
  IndexingPayload,
  ChangeWorkspaceMessage,
} from '@utils';
import { useStorage } from '@hooks';

type Payload = { [key: string]: IndexingPayload };

export const IndexingProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [payload, setPayload] = useState<Payload>({});
  const { updateStorage } = useStorage();

  useEffect(() => {
    updateStorage({ indexing: payload });
  }, [payload]);

  const handler = (event: MessageEvent<IndexingMessage | ChangeWorkspaceMessage>) => {
    if (event.data.type === COMMANDS.indexing) {
      const payload = event.data.payload;
      setPayload((prev) => ({ ...prev, [payload.workspace]: payload }));
    }

    if (event.data.type === COMMANDS.onChangeWorkspace) {
      setPayload(event.data.payload);
    }
  };

  useEffect(() => {
    globalListener.subscribe([COMMANDS.indexing, COMMANDS.onChangeWorkspace], handler);
    return () => {
      globalListener.unsubscribe([COMMANDS.indexing], handler);
    };
  }, []);

  const startIndexing = (value?: string) => {
    if (!value) {
      vscode.postMessage({ command: COMMANDS.indexing });
    } else {
      vscode.postMessage({ command: COMMANDS.indexing, value });
    }
  };

  return (
    <IndexingContext.Provider value={{ payload, startIndexing }}>
      {children}
    </IndexingContext.Provider>
  );
};
