import './edit.style.scss';
import { FC } from 'react';
import { FileIcon } from '@elements';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { getEditSummary } from '@utils';
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

type Props = {
  message: AgentMessagePayload<
    'editFile' | 'deleteFile' | 'createFile' | 'renameFile' | 'readFile'
  >;
};

export const FileActions: FC<Props> = ({ message }) => {
  const type = fileActions[message.type as keyof typeof fileActions];
  let changes;
  const editArgs = (message as AgentMessagePayload<'editFile'>).args;
  if (message.type === 'editFile') {
    changes = getEditSummary(editArgs);
  }
  const file = (
    <FileIcon
      onClick={() => {
        if (message.type === 'editFile') {
          const value = {
            old: editArgs.old ?? '',
            content: editArgs.content ?? '',
            file: editArgs.file ?? '',
          };
          vscode.postMessage({ command: COMMANDS.showPreview, value });
        }
      }}
      type={type as 'edit' | 'created' | 'deleted' | 'read'}
      path={message.args.file ?? ''}
      changes={changes}
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
