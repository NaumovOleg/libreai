import './styles.scss';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import theme from './theme.tsx';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider, ChatProvider } from '@providers';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <ConfigProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </ConfigProvider>
    </ThemeProvider>
  </StrictMode>,
);
