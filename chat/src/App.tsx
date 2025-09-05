import 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Chat, Settings } from '@pages';
import { Header } from '@components';

export default function App() {
  return (
    <Router>
      <Header />
      xqwxwqxqwxqwxqwxqwqw
      <Routes>
        <Route path="/" element={<Settings />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
