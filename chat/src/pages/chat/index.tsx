import './style.scss';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { useChat } from '@hooks';

import { BottomNavigation, TopNavigation, TextArea } from './components';

export const Chat = () => {
  const [input, setInput] = useState('');
  const { sendMessage } = useChat();

  return (
    <section className="chat-section">
      <Box className="messages-container"></Box>

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
