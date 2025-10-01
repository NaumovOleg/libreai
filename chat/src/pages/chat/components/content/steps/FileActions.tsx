import './edit.style.scss';
import { FC } from 'react';
import { FileIcon } from '@elements';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { getEditSummary } from '@utils';
import { AgentMessage } from '@utils';

const fileActions = {
  editFile: 'edit',
  deleteFile: 'delete',
  createFile: 'create',
};

type Props = {
  message: AgentMessage;
};

export const FileActions: FC<Props> = ({ message }) => {
  const type = fileActions[message.type as keyof typeof fileActions];
  const file = (
    <FileIcon
      type={type as 'edit' | 'created' | 'deleted'}
      path={message.args.file ?? ''}
      changes={message.args.content ? getEditSummary(message.args) : undefined}
    />
  );

  return (
    <div className={`message prose prose-invert agent`}>
      <div
        className="editFile"
        onClick={() => {
          console.log(message);
        }}
      >
        <div className="info">
          {message.status === 'pending' && (
            <div className="pending">
              {file}
              <CircularProgress size={15} className="icon" />
            </div>
          )}
          {message.status === 'error' && (
            <div className="error">
              <div className="file-line">Error while editing</div>
              <Typography color="error"> message.error</Typography>
            </div>
          )}
          {message.status === 'done' && <div className="done">{file}</div>}
        </div>
      </div>
    </div>
  );
};
