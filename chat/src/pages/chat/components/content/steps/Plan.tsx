import './steps.style.scss';
import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { AgentMessagePayload } from '../../../../../../../global.types';

type Props = {
  message: AgentMessagePayload<'planning'>;
};

export const Plan: FC<Props> = ({ message }) => {
  return (
    <div className={`message prose prose-invert agent`}>
      <div className="planning container">
        {message.status === 'pending' && (
          <div className="pending item">
            {message.args}
            <CircularProgress size={15} className="icon" />
          </div>
        )}
        {message.status === 'done' && (
          <div className="done item">
            {message.args}
            <DoneAllIcon className="done-icon" />
          </div>
        )}
        {message.status === 'error' && (
          <div className="error item">
            {message.args}
            <Typography color="error"> {message.error}</Typography>
          </div>
        )}
      </div>
    </div>
  );
};
