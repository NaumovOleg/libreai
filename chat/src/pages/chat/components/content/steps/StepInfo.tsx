import './steps.scss';
import { FC } from 'react';
import Typography from '@mui/material/Typography';
import { AgentMessagePayload } from '@utils';
import CircularProgress from '@mui/material/CircularProgress';
import { FaCheck } from 'react-icons/fa';
import { FcCancel } from 'react-icons/fc';

type Props = {
  message: AgentMessagePayload<'analizing' | 'executing' | 'planning'>;
};

export const StepInfo: FC<Props> = ({ message }) => {
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
            <FaCheck className="done-icon icon" />
          </div>
        )}
        {message.status === 'error' && (
          <div className="error item">
            <div className="error-line">
              {message.args} <FcCancel className="icon" />
            </div>

            <Typography color="error"> {message.error}</Typography>
          </div>
        )}
      </div>
    </div>
  );
};
