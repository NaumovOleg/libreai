import './style.scss';
import { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useChat } from '@hooks';
import { RiRobot3Line } from 'react-icons/ri';
import Icon from '@mui/material/Icon';
import { TextArea, Message } from './components';
import { TypingDots } from '@elements';
import { MdLabelOutline } from 'react-icons/md';
import { Author, vscode, COMMANDS } from '@utils';
import { GiCancel } from 'react-icons/gi';
import IconButton from '@mui/material/IconButton';

const renderDivider = () => {
  return (
    <div className="message-divider">
      <div className="icon">
        <MdLabelOutline />
      </div>
      <div className="border-line"></div>
    </div>
  );
};

export const Chat = () => {
  const { messages, isAgentThinking, isStreaming } = useChat();

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

  const onAbortClick = () => {
    vscode.postMessage({ command: COMMANDS.abortAgentWorkflow });
  };

  return (
    <section className="chat-section">
      <Box className="messages-container" ref={containerRef} onScroll={handleScroll}>
        {messages.map((el, index) => {
          const nextMessage = (messages[index + 1] ?? {}) as { from?: Author };
          const drawDivider = nextMessage?.from === Author.user;

          return (
            <div key={el.id}>
              <Message message={el} isLoading={false} onDelete={() => {}} />
              {drawDivider && renderDivider()}
            </div>
          );
        })}
        {isStreaming && <TypingDots />}
        {isAgentThinking && (
          <div className="agent-info-panel">
            <div className="agent-spinner">
              <Icon>
                <RiRobot3Line />
              </Icon>
              <TypingDots />
            </div>
            <IconButton onClick={onAbortClick} className="abort-button">
              <GiCancel />
            </IconButton>
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
