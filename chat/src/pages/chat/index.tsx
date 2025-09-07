import './style.scss';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { useChat } from '@hooks';

import { BottomNavigation, TopNavigation, TextArea, Message } from './components';

export const Chat = () => {
  const [input, setInput] = useState<string | undefined>();
  const { sendMessage, messages } = useChat();

  return (
    <section className="chat-section">
      <TopNavigation />
      <Box className="messages-container">
        {messages.map((el) => (
          <Message key={el.id} message={el} isLoading={false} onDelete={() => {}} />
        ))}
      </Box>

      <Box className="send-container">
        <TextArea
          onPressEnter={() => {
            setInput('');
            sendMessage({ text: input ?? '' });
          }}
          value={input}
          onChange={(val) => setInput(val)}
        />
        <BottomNavigation
          sendMessage={() => {
            setInput('');
            sendMessage({ text: input ?? '' });
          }}
        />
      </Box>
    </section>
  );
};
