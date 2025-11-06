import './steps.scss';
import { FC } from 'react';
import { FileIcon } from '@elements';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { vscode, COMMANDS, AgentMessagePayload, getEditSummary } from '@utils';
import { FcCancel } from 'react-icons/fc';
import { FaCheck } from 'react-icons/fa';
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
  renameFile: 'Renamed:',
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
  const editArgs = (message as AgentMessagePayload<'editFile' | 'createFile'>).args;
  if (['editFile', 'createFile'].includes(message.type)) {
    changes = getEditSummary(editArgs);
  }
  const file = (
    <FileIcon
      onClick={() => {
        if (['editFile', 'createFile'].includes(message.type)) {
          const value = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            old: (editArgs as any).old ?? '',
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
    <div>
      <div className="file-actions container">
        {message.status === 'pending' && (
          <div className="pending item">
            <div className="line">{messages[message.type]}</div> {file}
            <CircularProgress size={15} className="icon" />
          </div>
        )}
        {message.status === 'error' && (
          <div className="error item">
            <div className="error-line">
              <div className="line">{messages[message.type]}</div> {file}{' '}
              <FcCancel className="icon" />
            </div>

            <Typography color="error"> {message.error} Error test </Typography>
          </div>
        )}
        {message.status === 'done' && (
          <div className="done item">
            <div className="done-line line">{messages[message.type]}</div>
            {file}
            <FaCheck className="done-icon icon" />
          </div>
        )}
      </div>
    </div>
  );
};
