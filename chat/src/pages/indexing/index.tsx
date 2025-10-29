import './style.scss';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { normalizeWorkspaceName } from '@utils';

import { useIndexing } from '@hooks';

export const IndexWorkspace = () => {
  const { startIndexing, payload } = useIndexing();

  const renderWorkspaceProcess = () => {
    return Object.entries(payload).map(([key, payload]) => {
      return (
        <div className="workspace-container">
          <div className="header">
            Workspace {normalizeWorkspaceName(key)} indexing: {payload?.progress ?? 0}%
          </div>
          <div className="progress">
            <LinearProgress
              className="progress-bar"
              variant="determinate"
              value={payload?.progress ?? 0}
            />
          </div>
          <button disabled={payload?.status === 'pending'} onClick={() => startIndexing(key)}>
            {payload?.status === 'done' ? 'Reindex workspace' : 'Start indexing'}
          </button>
          <Typography color="error">{payload?.error}</Typography>
        </div>
      );
    });
  };

  return (
    <section className="index-workspace">
      {renderWorkspaceProcess()}
      <button onClick={() => startIndexing()}>Reindex all</button>
    </section>
  );
};
