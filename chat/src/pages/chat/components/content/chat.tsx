import { FC } from 'react';
import { ChatMessage } from '@utils';
import { getMessageContent } from '../../utils';
import { Code } from '../utils';

type Props = {
  message: ChatMessage;
};

export const ChatMessageContent: FC<Props> = ({ message }) => {
  return (
    <div className={`message prose prose-invert ${message.from}`}>
      <div className="message-markdown">
        <Code type="code" text={getMessageContent(message)} />
      </div>
    </div>
  );
};
