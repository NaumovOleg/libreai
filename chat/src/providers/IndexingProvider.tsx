import { useState, type FC, type ReactElement, useEffect } from 'react';
import { IndexingContext } from './context';
import { COMMANDS, vscode, globalListener, IndexingMessage, IndexingPayload } from '@utils';

export const IndexingProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [payload, setPayload] = useState<IndexingPayload>(() => {
    return vscode.getState().indexing;
  });

  useEffect(() => {
    if (payload?.status === 'done') {
      vscode.setState({ ...vscode.getState(), indexing: payload });
    }
  }, [payload]);

  const handler = (event: MessageEvent<IndexingMessage>) => {
    if (event.data.type === COMMANDS.indexing) {
      setPayload(event.data.payload);
    }
  };

  useEffect(() => {
    globalListener.subscribe([COMMANDS.indexing], handler);
    return () => {
      globalListener.unsubscribe([COMMANDS.indexing], handler);
    };
  }, []);

  const startIndexing = () => {
    vscode.postMessage({ command: COMMANDS.indexing });
  };

  return (
    <IndexingContext.Provider value={{ payload, startIndexing }}>
      {children}
    </IndexingContext.Provider>
  );
};
