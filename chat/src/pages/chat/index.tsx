import './style.scss';
import { useState } from 'react';
import Box from '@mui/material/Box';

import { BottomNavigation, TopNavigation, TextArea } from './components';

export const Chat = () => {
  const [input, setInput] = useState('');

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
        <BottomNavigation />
      </Box>
    </section>
  );
};
