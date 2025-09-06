import { useState, type FC, type ReactElement, useEffect } from 'react';
import { ChatContext } from './context';
import { State, ChatMessage, vscode, uuid, COMMANDS } from '@utils';

export const ChatProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [sessions, setSessions] = useState(() => {
    const { chatSession } = vscode.getState() as State;
    if (chatSession) return chatSession;
    const newSession = { [uuid()]: [] };
    vscode.setState({ chatSession: newSession });
    return newSession;
  });

  const [tmpMessage, seTemporaryMessage] = useState<ChatMessage | undefined>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSessionId] = useState<string>(() => {
    const { lastSession } = vscode.getState() as State;
    return lastSession ?? Object.keys(sessions ?? {})[0];
  });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === COMMANDS['chat-stream']) {
        seTemporaryMessage((prev) => {
          if (!prev) {
            return { id: uuid(7), from: 'ai', time: new Date(), text: event.data.payload };
          }
          return { ...prev, text: prev.text + event.data.payload };
        });
      }
      if (event.data.type === COMMANDS['chat-stream-end']) {
        seTemporaryMessage((prevMsg) => {
          if (!prevMsg) return undefined;
          setSessions((prevSession) => {
            return {
              ...prevSession,
              [session]: prevSession[session].concat(prevMsg),
            };
          });
          setMessages((prev) => [...prev, prevMsg]);
          return undefined;
        });
      }
    };
    window.addEventListener('message', handler);
  }, [session]);

  useEffect(() => {
    if (!messages.length) {
      setMessages(sessions[session] ?? []);
    }
  }, [sessions, session]);

  const setSession = (sessionId: string) => {
    setSessionId(sessionId);
    setMessages(sessions[session] ?? []);
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
    setMessages([]);
  };

  const removeSession = (sessionId: string) => {
    setSessions((prev) => {
      delete prev[sessionId];
      vscode.setState({ ...vscode.getState(), chatSession: prev });
      return { ...prev };
    });
  };

  const sendMessage = (data: Omit<ChatMessage, 'id' | 'time' | 'from'>) => {
    const message: ChatMessage = {
      ...data,
      id: uuid(7),
      from: 'user',
      time: new Date(),
    };
    setSessions((s) => {
      const data = {
        ...s,
        [session]: [...s[session], message],
      };

      vscode.setState({ ...vscode.getState(), chatSession: data });
      vscode.postMessage({ command: COMMANDS.sendMessage, value: message });
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
    tmpMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
