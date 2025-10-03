import { FC } from 'react';

import { Plan, FileActions } from './steps';
import { AgentMessage } from '../../../../../../global.types';

type Props = {
  message: AgentMessage;
};

export const AgentMessageContent: FC<Props> = ({ message }) => {
  const renderContent = () => {
    if (message.type === 'planning') {
      return <Plan message={message as AgentMessage<string>} />;
    }
    if (['editFile', 'deleteFile', 'createFile', 'renameFile', 'readFile'].includes(message.type)) {
      return <FileActions message={message} />;
    }
    return null;
  };

  return (
    <div className={`message prose prose-invert agent`}>
      <div className="message-markdown agent-message">{renderContent()}</div>
    </div>
  );
};
