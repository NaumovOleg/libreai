import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import DoneAllIcon from '@mui/icons-material/DoneAll';
type Props = {
  message: AgentMessage;
};

// id: 'ZBZg';
// session: 'WBjN';
// status: 'pending';
// type: 'planning';

export const AgentMessageContent: FC<Props> = ({ message }) => {
  if (message.type === 'planning') {
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
  }
  return (
    <div className={`message prose prose-invert agent`}>
      <div className="message-markdown">{message.args}aaaa</div>
    </div>
  );
};
