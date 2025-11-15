import { FC } from 'react';

import { FileActions, Command, AgentResponse, StepInfo } from './steps';
import { AgentMessage, AgentMessagePayload } from '../../../../../../global.types';

type Props = {
  message: AgentMessage;
};

export const AgentMessageContent: FC<Props> = ({ message }) => {
  const renderContent = () => {
    if (['planning', 'executing', 'analizing'].includes(message.type)) {
      return (
        <StepInfo
          message={message as AgentMessagePayload<'analizing' | 'executing' | 'planning'>}
        />
      );
    }
    if (['editFile', 'deleteFile', 'createFile', 'renameFile', 'readFile'].includes(message.type)) {
      return (
        <FileActions
          message={
            message as AgentMessagePayload<
              'editFile' | 'deleteFile' | 'createFile' | 'renameFile' | 'readFile'
            >
          }
        />
      );
    }

    if (message.type === 'command') {
      return <Command message={message as AgentMessagePayload<'command'>} />;
    }
    if (message.type === 'agentResponse') {
      return <AgentResponse message={message as AgentMessagePayload<'agentResponse'>} />;
    }

    return null;
  };

  return (
    <div className={`message prose prose-invert agent`}>
      <div className="message-markdown agent-message">{renderContent()}</div>
    </div>
  );
};
