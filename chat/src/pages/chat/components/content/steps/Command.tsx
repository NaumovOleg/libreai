import './steps.style.scss';
import { FC } from 'react';
import Typography from '@mui/material/Typography';
import { AgentMessagePayload, vscode, COMMANDS } from '@utils';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { GiCancel } from 'react-icons/gi';
import IconButton from '@mui/material/IconButton';
import { FaCheck } from 'react-icons/fa';
type Props = {
  message: AgentMessagePayload<'command'>;
};

export const Command: FC<Props> = ({ message }) => {
  const command = (
    <span className="command-line">
      {message.args.command}

      {message.status === 'pending' && (
        <div className="command-control">
          <IconButton className="confirm" onClick={() => onClickCommand('confirmed')}>
            <FaCheck />
          </IconButton>
          <IconButton className="decline" onClick={() => onClickCommand('declined')}>
            <GiCancel />
          </IconButton>
        </div>
      )}
    </span>
  );
  const onClickCommand = (state: 'confirmed' | 'declined') => {
    vscode.postMessage({
      command: COMMANDS.interactCommand,
      value: { state, id: message.id },
    });
  };
  return (
    <div>
      <div className="command container">
        {message.status === 'error' && (
          <div className="error item">
            <div className="command-line">Error while executing command {command}</div>
            <Typography color="error">{message.error}</Typography>
          </div>
        )}
        {message.status === 'pending' && (
          <div className="pending item">
            <div> Awaiting: </div>
            {command}
          </div>
        )}
        {message.status === 'done' && (
          <div className="done item">
            Cmd:
            {command}
            {message.args.state === 'confirmed' ? (
              <DoneAllIcon className="done-icon icon" />
            ) : (
              <GiCancel className="cancel-icon icon" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
