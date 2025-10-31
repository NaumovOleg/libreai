import 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Chat, Settings, IndexWorkspace, StartPage } from '@pages';
import { Header } from '@components';
import { useConfig } from '@hooks';

export default function App() {
  const { isConfigSetted, isConfigInited } = useConfig();

  if (!isConfigInited) return null;
  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            !isConfigSetted.agentConfig && isConfigSetted.chatConfig ? <Chat /> : <StartPage />
          }
        />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/indexing" element={<IndexWorkspace />} />
      </Routes>
    </Router>
  );
}
