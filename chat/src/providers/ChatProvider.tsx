import { useState, type FC, type ReactElement, useId, useEffect } from 'react';
import { ChatContext } from './context';
import { State, ChatMessage, vscode } from '@utils';

export const ChatProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [sessions, setSessions] = useState(() => {
    const { chatSession } = vscode.getState() as State;
    if (chatSession) return chatSession;
    const newSession = { [useId()]: [] };
    // vscode.setState({ chatSession: newSession });
    return newSession;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<string>(() => Object.keys(sessions ?? {})[0]);

  useEffect(() => {
    if (sessions[session]?.length) {
      setMessages(sessions[session]);
    }
  }, [sessions[session]]);

  const sendMessage = (message: ChatMessage) => {
    setSessions((s) => {
      s[session] = [...s[session], message];
      vscode.setState({
        ...(vscode.getState() as State),
        chatSession: s,
      });
      return s;
    });
  };

  const sessionList = Object.keys(sessions)?.length ? Object.keys(sessions) : [session];

  const value = { messages, setSession, session, sessions: sessionList, sendMessage };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
