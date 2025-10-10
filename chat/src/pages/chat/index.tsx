import './style.scss';
import Box from '@mui/material/Box';
import { useChat } from '@hooks';
import { RiRobot3Line } from 'react-icons/ri';
import Icon from '@mui/material/Icon';
import { TopNavigation, TextArea, Message } from './components';
import { TypingDots } from '@elements';

export const Chat = () => {
  const { messages, isAgentThinking } = useChat();

  return (
    <section className="chat-section">
      <TopNavigation />
      <Box className="messages-container">
        {messages.map((el) => (
          <Message key={el.id} message={el} isLoading={false} onDelete={() => {}} />
        ))}
        {isAgentThinking && (
          <div className="agent-spinner">
            <Icon>
              <RiRobot3Line />
            </Icon>
            <TypingDots />
          </div>
        )}
      </Box>

      <Box className="send-container">
        <TextArea />
      </Box>
    </section>
  );
};
