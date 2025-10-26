import './steps.scss';
import { FC } from 'react';
import Typography from '@mui/material/Typography';
import { AgentMessagePayload } from '@utils';
import CircularProgress from '@mui/material/CircularProgress';
import DoneAllIcon from '@mui/icons-material/DoneAll';

type Props = {
  message: AgentMessagePayload<'analizing'>;
};

export const Analizing: FC<Props> = ({ message }) => {
  return (
    <div>
      <div className="analizing container">
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
