import './steps.style.scss';
import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { AgentMessagePayload } from '@utils';
import DoneAllIcon from '@mui/icons-material/DoneAll';

type Props = {
  message: AgentMessagePayload<'command'>;
};

export const Command: FC<Props> = ({ message }) => {
  const command = <span className="command-line">{message.args.command}</span>;
  return (
    <div className={`message prose prose-invert agent`}>
      <div className="command container">
        {message.status === 'error' && (
          <div className="error item">
            <div className="command-line">Error while executing command {command}</div>
            <Typography color="error">{message.error}</Typography>
          </div>
        )}
        {message.status === 'pending' && (
          <div className="pending item">
            Executing command: {command}
            <CircularProgress size={15} className="icon" />
          </div>
        )}
        {message.status === 'done' && (
          <div className="done item">
            Command:
            {command}
            <DoneAllIcon className="done-icon" />
          </div>
        )}
      </div>
    </div>
  );
};
