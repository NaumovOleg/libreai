import { FC } from 'react';
import { FileIcon } from '@elements';
import CircularProgress from '@mui/material/CircularProgress';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { diffWords } from 'diff';
import { Code } from '../../utils';
type Props = {
  message: AgentMessage;
};

export const Edit: FC<Props> = ({ message }) => {
  const showDiff = (args: AgentMessage['args']) => {
    if (!args.content || !args.oldContent) return null;
    const diff = diffWords(args.oldContent, args.content);

    const text = diff
      .map((part) => {
        if (part.added) return `<ins>${part.value}</ins>`; // additions
        if (part.removed) return `~~${part.value}~~`; // removals
        return part.value;
      })
      .join('');

    return <Code text={`\`\`\`typescript \n ${text} \n \`\`\``} type="diff" />;
  };
  return (
    <div className={`message prose prose-invert agent`}>
      <div className="editFile">
        Applying changes: <FileIcon path={message.args.file ?? ''} />
        {message.status === 'pending' && <CircularProgress size={15} className="icon" />}
        {message.status === 'done' && <DoneAllIcon className="icon" />}
        {message.status === 'error' && message.error}
        {showDiff(message.args)}
      </div>
    </div>
  );
};
