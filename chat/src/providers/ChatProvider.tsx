import { useState, type FC, type ReactElement, useEffect } from 'react';
import { ChatContext } from './context';
import { State, ChatMessage, vscode, uuid } from '@utils';

export const ChatProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [sessions, setSessions] = useState(() => {
    const { chatSession } = vscode.getState() as State;
    if (chatSession) return chatSession;
    const newSession = { [uuid()]: [] };
    vscode.setState({ chatSession: newSession });
    return newSession;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSessionId] = useState<string>(() => {
    const { lastSession } = vscode.getState() as State;
    return lastSession ?? Object.keys(sessions ?? {})[0];
  });

  useEffect(() => {
    if (sessions[session]?.length) {
      setMessages(sessions[session]);
    }
  }, [sessions]);

  const setSession = (sessionId: string) => {
    setSessionId(sessionId);
    vscode.setState({ ...vscode.getState(), lastSession: sessionId });
  };

  const addSession = () => {
    const newSession = uuid();
    setSessions((prev) => {
      const data = { ...prev, [newSession]: [] };

      vscode.setState({ ...vscode.getState(), chatSession: data });
      return data;
    });
    setSession(newSession);
  };

  const removeSession = (sessionId: string) => {
    setSessions((prev) => {
      delete prev[sessionId];
      vscode.setState({ ...vscode.getState(), chatSession: prev });
      return { ...prev };
    });
  };

  const sendMessage = (message: ChatMessage) => {
    setSessions((s) => {
      const data = {
        ...s,
        [session]: [...s[session], message],
      };

      vscode.setState({ ...vscode.getState(), chatSession: data });
      return data;
    });
  };

  const sessionList = Object.keys(sessions)?.length ? Object.keys(sessions) : [session];

  const value = {
    messages,
    addSession,
    setSession,
    session,
    sessions: sessionList.reverse(),
    sendMessage,
    removeSession,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
