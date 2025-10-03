import './edit.style.scss';
import { FC } from 'react';
import { FileIcon } from '@elements';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { getEditSummary } from '@utils';
import { AgentMessage } from '@utils';
import { vscode, COMMANDS } from '@utils';
import DoneAllIcon from '@mui/icons-material/DoneAll';
const fileActions = {
  editFile: 'edit',
  deleteFile: 'delete',
  createFile: 'create',
  readFile: 'read',
};

const messages = {
  editFile: 'Edit:',
  deleteFile: 'Delete:',
  createFile: 'Create:',
  readFile: 'Read:',
  renameFile: 'Read:',
  planning: '',
  command: '',
};

type Props = { message: AgentMessage };

export const FileActions: FC<Props> = ({ message }) => {
  const type = fileActions[message.type as keyof typeof fileActions];
  const file = (
    <FileIcon
      onClick={() => {
        if (type === 'edit') {
          const value = {
            old: message.args.old ?? '',
            content: message.args.content ?? '',
            file: message.args.file ?? '',
          };
          vscode.postMessage({ command: COMMANDS.showPreview, value });
        }
      }}
      type={type as 'edit' | 'created' | 'deleted' | 'read'}
      path={message.args.file ?? ''}
      changes={message.args.content ? getEditSummary(message.args) : undefined}
    />
  );

  return (
    <div className={`message prose prose-invert agent`}>
      <div className="file-actions">
        <div className="info">
          {message.status === 'pending' && (
            <div className="pending item">
              {messages[message.type]} {file}
              <CircularProgress size={15} className="icon" />
            </div>
          )}
          {message.status === 'error' && (
            <div className="error item">
              <div className="file-line">{messages[message.type]} Error</div>
              <Typography color="error"> {message.error}</Typography>
            </div>
          )}
          {message.status === 'done' && (
            <div className="done item">
              {messages[message.type]}
              {file}
              <DoneAllIcon className="done-icon" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
