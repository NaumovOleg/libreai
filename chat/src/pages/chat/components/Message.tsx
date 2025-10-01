import { FC } from 'react';
import { AgentMessage, ChatMessage, isAgentMessage } from '@utils';

type Props = {
  message: ChatMessage | AgentMessage;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

import { ChatMessageContent, AgentMessageContent } from './content';

export const Message: FC<Props> = ({ message }) => {
  if (isAgentMessage(message)) return <AgentMessageContent message={message} />;
  return <ChatMessageContent message={message} />;
};
