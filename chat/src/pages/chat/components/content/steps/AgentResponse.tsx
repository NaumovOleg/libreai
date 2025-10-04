import './steps.style.scss';
import { FC } from 'react';
import Typography from '@mui/material/Typography';
import { AgentMessagePayload } from '@utils';

type Props = {
  message: AgentMessagePayload<'agentResponse'>;
};

export const AgentResponse: FC<Props> = ({ message }) => {
  return (
    <div className={`message prose prose-invert agent`}>
      <div className="agent-response container">
        {message.status === 'error' && (
          <div className="error item">
            <div className="command-line">Agent respond with error</div>
            <Typography color="error">{message.error}</Typography>
          </div>
        )}
        {message.status === 'done' && <div className="pending item"> {message.args.content}</div>}
      </div>
    </div>
  );
};
