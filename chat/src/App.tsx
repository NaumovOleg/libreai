import * as React from 'react';

export default function App() {
  const [messages, setMessages] = React.useState<string[]>([]);
  const [input, setInput] = React.useState('');

  function sendMessage() {
    if (!input) return;
    setMessages([...messages, `User: ${input}`]);
    // Симуляция ответа AI
    setTimeout(() => setMessages((m) => [...m, `AI: Echo "${input}"`]), 500);
    setInput('');
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.startsWith('AI') ? 'ai-message' : 'user-message'}>
            {msg}
          </div>
        ))}
      </div>
      <div className="input-box">
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
