import './style.scss';
import { useEffect, useState } from 'react';
import { COMMANDS, vscode, globalListener } from '@utils';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

type IndexingPayload = {
  status: 'done' | 'pending' | 'error';
  progress: number;
  indexed: number;
  currentFile?: string;
  error?: string;
  total: number;
};

type IndexingMessage = {
  type: 'indexing';
  payload: IndexingPayload;
};

export const IndexWorkspace = () => {
  const [payload, setPayload] = useState<IndexingPayload>(() => {
    return vscode.getState().indexing;
  });
  const handler = (event: MessageEvent<IndexingMessage>) => {
    if (event.data.type === COMMANDS.indexing) {
      setPayload(event.data.payload);
    }
  };

  useEffect(() => {
    if (payload?.status === 'done') {
      vscode.setState({ ...vscode.getState(), indexing: payload });
    }
  }, [payload]);
  useEffect(() => {
    vscode.postMessage({ command: COMMANDS.configListenerMounted });

    globalListener.subscribe([COMMANDS.indexing], handler);
    return () => {
      globalListener.unsubscribe([COMMANDS.indexing], handler);
    };
  }, []);

  const startIndexing = () => {
    vscode.postMessage({ command: COMMANDS.indexing });
  };

  return (
    <section className="index-workspace">
      <div className="header">Workspace indexing: {payload?.progress ?? 0}%</div>
      <div className="progress">
        <LinearProgress
          className="progress-bar"
          variant="determinate"
          value={payload?.progress ?? 0}
        />
      </div>
      <button disabled={payload?.status === 'pending'} onClick={startIndexing}>
        {payload?.status === 'done' ? 'Reindex workspace' : 'Start indexing'}
      </button>
      <Typography color="error">{payload?.error}</Typography>
    </section>
  );
};
