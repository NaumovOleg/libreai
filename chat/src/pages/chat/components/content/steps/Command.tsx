import './steps.scss';
import { FC } from 'react';
import Typography from '@mui/material/Typography';
import { AgentMessagePayload, vscode, COMMANDS } from '@utils';
import { GiCancel } from 'react-icons/gi';
import IconButton from '@mui/material/IconButton';
import { FaCheck } from 'react-icons/fa';
import { FcCancel } from 'react-icons/fc';
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
            <div className="command-error">
              Error {command} <FcCancel className="icon" />{' '}
            </div>
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
          <>
            <div className="done item">
              <span className="prefix"> Cmd:</span>
              {command}
              {message.args.state === 'confirmed' ? (
                <FaCheck className="done-icon icon" />
              ) : (
                <GiCancel className="cancel-icon icon" />
              )}
            </div>
            {message.args.result && (
              <div className="result">
                <span className="prefix result-prefix"> Result:</span>
                {message.args.result}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
