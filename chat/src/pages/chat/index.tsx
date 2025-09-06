import './style.scss';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { useChat } from '@hooks';

import { BottomNavigation, TopNavigation, TextArea } from './components';

export const Chat = () => {
  const [input, setInput] = useState('');
  const { sendMessage, messages } = useChat();

  return (
    <section className="chat-section">
      <Box className="messages-container">
        {messages.map((el) => {
          return <Box>{el.text}</Box>;
        })}
      </Box>

      <Box className="send-container">
        <TopNavigation />
        <TextArea
          value={input}
          onChange={(val) => setInput(val)}
          // onKeyDown={}
        />
        <BottomNavigation sendMessage={() => sendMessage({ text: input })} />
      </Box>
    </section>
  );
};
