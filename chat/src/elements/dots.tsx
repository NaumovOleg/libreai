import React from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/system';

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

export const TypingDots: React.FC = () => {
  return (
    <Box
      className="typing-dots"
      display="flex"
      gap={0.5}
      alignItems="center"
      justifyContent="center"
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            bgcolor: 'var(--vscode-editor-foreground)',
            borderRadius: '50%',
            animation: `${bounce} 1.4s infinite ease-in-out`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </Box>
  );
};
