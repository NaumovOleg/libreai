import './edit.style.scss';
import { FC } from 'react';
import { FileIcon, Accordion } from '@elements';
import CircularProgress from '@mui/material/CircularProgress';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Typography from '@mui/material/Typography';
import { diffLines } from 'diff';
import { Code } from '../../utils';
import Divider from '@mui/material/Divider';

type Props = {
  message: AgentMessage;
};

export const Edit: FC<Props> = ({ message }) => {
  const showDiff = (args: AgentMessage['args']) => {
    if (!args.content || !args.oldContent) return null;

    const diff = diffLines(args.oldContent, args.content);

    const diffText = diff
      .map((part) => {
        if (part.added) {
          return part.value
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line) => `+ ${line}`)
            .join('\n');
        }
        if (part.removed) {
          return part.value
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line) => `- ${line}`)
            .join('\n');
        }
        return part.value
          .split('\n')
          .filter((line) => line.trim() !== '')
          .map((line) => `  ${line}`)
          .join('\n');
      })
      .join('\n')
      .trim();

    return <Code text={`\`\`\`diff\n${diffText}\n\`\`\``} type="diff" />;
  };

  return (
    <div className={`message prose prose-invert agent`}>
      <div className="editFile">
        <Divider />
        <div className="info">
          {message.status === 'pending' && (
            <div className="pending">
              Applying changes: <FileIcon path={message.args.file ?? ''} />
              <CircularProgress size={15} className="icon" />
            </div>
          )}
          {message.status === 'error' && (
            <div className="error">
              <div className="file-line">
                Error while editing <FileIcon path={message.args.file ?? ''} />
              </div>
              <Typography color="error"> message.error</Typography>
            </div>
          )}
          {message.status === 'done' && (
            <div className="done">
              <Accordion
                items={[
                  {
                    id: 'editFile',
                    title: (
                      <div className="header-item">
                        <DoneAllIcon className="icon" />
                        <FileIcon path={message.args.file ?? ''} />
                      </div>
                    ),
                    content: showDiff(message.args),
                  },
                ]}
              ></Accordion>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
