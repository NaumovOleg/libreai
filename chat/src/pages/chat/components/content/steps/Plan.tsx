import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { AgentMessage } from '../../../../../../../global.types';

type Props = {
  message: AgentMessage<string>;
};

export const Plan: FC<Props> = ({ message }) => {
  return (
    <div className={`message prose prose-invert agent`}>
      <div className="planning">
        {message.args}{' '}
        {message.status === 'pending' && <CircularProgress size={15} className="icon" />}
        {message.status === 'done' && <DoneAllIcon className="done-icon" />}
        {message.status === 'error' && message.error}
      </div>
    </div>
  );
};
