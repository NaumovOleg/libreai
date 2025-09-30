import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import DoneAllIcon from '@mui/icons-material/DoneAll';

type Props = {
  message: AgentMessage;
};

export const Plan: FC<Props> = ({ message }) => {
  return (
    <div className={`message prose prose-invert agent`}>
      <div className="planning">
        Planning steps:{' '}
        {message.status === 'pending' && <CircularProgress size={15} className="icon" />}
        {message.status === 'done' && <DoneAllIcon className="icon" />}
        {message.status === 'error' && message.error}
      </div>
    </div>
  );
};
