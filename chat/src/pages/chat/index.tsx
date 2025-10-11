import './style.scss';
import { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useChat } from '@hooks';
import { RiRobot3Line } from 'react-icons/ri';
import Icon from '@mui/material/Icon';
import { TopNavigation, TextArea, Message } from './components';
import { TypingDots } from '@elements';

export const Chat = () => {
  const { messages, isAgentThinking } = useChat();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 50);
  };

  useEffect(() => {
    if (!isAtBottom) return;

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentThinking, isAtBottom]);

  return (
    <section className="chat-section">
      <TopNavigation />
      <Box className="messages-container" ref={containerRef} onScroll={handleScroll}>
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
        <div ref={messagesEndRef} />
      </Box>

      <Box className="send-container">
        <TextArea />
      </Box>
    </section>
  );
};
