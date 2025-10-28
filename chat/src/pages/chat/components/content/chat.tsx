import { FC } from 'react';
import { ChatMessage } from '@utils';
import { getMessageContent } from '../../utils';
import { Code } from '../utils';
import { FileIcon } from '@elements';

type Props = {
  message: ChatMessage;
};

export const ChatMessageContent: FC<Props> = ({ message }) => {
  return (
    <div className={`message prose prose-invert ${message.from}`}>
      <div className="message-markdown">
        {!!message.files?.length && (
          <div className="user-files">
            {message.files.map((el) => (
              <FileIcon path={el.relative} />
            ))}
          </div>
        )}
        <Code type="code" text={getMessageContent(message)} />
      </div>
    </div>
  );
};
