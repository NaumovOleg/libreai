import './style.scss';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

import { useIndexing } from '@hooks';

export const IndexWorkspace = () => {
  const { startIndexing, payload } = useIndexing();

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
