import './edit.style.scss';
import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { AgentMessage } from '@utils';

type Props = {
  message: AgentMessage;
};

export const Command: FC<Props> = ({ message }) => {
  return (
    <div className={`message prose prose-invert agent`}>
      <div className="command">
        <div className="info">
          {message.status === 'error' && (
            <div className="error">
              <div className="command-line">
                Error while executing command <span>{message.args.command}</span>
              </div>
              <Typography color="error"> message.error</Typography>
            </div>
          )}
          {message.status === 'error' && (
            <div className="pending">
              <div className="command-line">
                Executing command: <span>{message.args.command}</span>
              </div>
              <CircularProgress size={15} className="icon" />
            </div>
          )}
          {message.status === 'done' && <div>{message.args.command}</div>}
        </div>
      </div>
    </div>
  );
};
