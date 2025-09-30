import { FC } from 'react';

import { Plan, Edit } from './steps';
type Props = {
  message: AgentMessage;
};

// id: 'ZBZg';
// session: 'WBjN';
// status: 'pending';
// type: 'planning';

export const AgentMessageContent: FC<Props> = ({ message }) => {
  const renderContent = () => {
    if (message.type === 'planning') {
      return <Plan message={message} />;
    }
    if (message.type === 'editFile') {
      return <Edit message={message} />;
    }
    return null;
  };

  return (
    <div className={`message prose prose-invert agent`}>
      <div className="message-markdown">{renderContent()}</div>
    </div>
  );
};
