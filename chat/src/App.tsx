import 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Chat, Settings, IndexWorkspace } from '@pages';
import { Header } from '@components';

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/indexing" element={<IndexWorkspace />} />
      </Routes>
    </Router>
  );
}
