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

type Payload = { [key: string]: IndexingPayload };

export const IndexingProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [payload, setPayload] = useState<Payload>(() => {
    return vscode.getState().indexing ?? {};
  });

  const [workspaces, setWorkspaces] = useState<string[]>([]);

  useEffect(() => {
    vscode.setState({ ...vscode.getState(), indexing: payload });
  }, [payload]);

  const handler = (event: MessageEvent<IndexingMessage | ChangeWorkspaceMessage>) => {
    if (event.data.type === COMMANDS.indexing) {
      const payload = event.data.payload;
      setPayload((prev) => ({ ...prev, [payload.workspace]: payload }));
    }

    if (event.data.type === COMMANDS.onChangeWorkspace) {
      setWorkspaces(event.data.payload);
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

  const value = Object.entries(payload).reduce((acc, [key, val]) => {
    if (workspaces.includes(key)) {
      acc[val.workspace] = val;
    }
    return acc;
  }, {} as Payload);

  return (
    <IndexingContext.Provider value={{ payload: value, startIndexing }}>
      {children}
    </IndexingContext.Provider>
  );
};
