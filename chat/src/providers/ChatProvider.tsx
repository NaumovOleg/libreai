import { useState, type FC, type ReactElement, useEffect, useRef } from 'react';
import { ChatContext } from './context';
import { State, ChatMessage, vscode, uuid, COMMANDS, Providers } from '@utils';

export const ChatProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [sessions, setSessions] = useState(() => {
    const state = vscode.getState() as State;
    if (state?.chatSession) return state?.chatSession;
    const newSession = { [uuid()]: [] };
    vscode.setState({ chatSession: newSession });
    return newSession;
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setProvider] = useState<Providers>(Providers.ai);
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  const [tmpMessage, seTemporaryMessage] = useState<ChatMessage | undefined>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSessionId] = useState<string>(() => {
    const { lastSession } = vscode.getState() as State;
    return lastSession ?? Object.keys(sessions ?? {})[0];
  });

  const sessionRef = useRef(session);

  const updateLastMessage = (message: ChatMessage) => {
    setSessions((chatSession) => {
      const data = {
        ...chatSession,
        [sessionRef.current]: chatSession[sessionRef.current].concat(message),
      };
      vscode.setState({ ...vscode.getState(), chatSession: data });
      return data;
    });
    setIsStreaming(false);
    setMessages((prev) => [...prev, message]);
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === COMMANDS.chatStream) {
        setIsStreaming(true);
        seTemporaryMessage(event.data.payload);
      }
      if (event.data.type === COMMANDS.chatStreamEnd) {
        seTemporaryMessage((prevMsg) => {
          if (!prevMsg) return undefined;
          updateLastMessage(prevMsg);
          return undefined;
        });
        setIsStreaming(true);
      }
      if (event.data.type === COMMANDS.agentResponse) {
        updateLastMessage(event.data.payload);
        setIsAgentThinking(false);
      }
    };
    window.addEventListener('message', handler);
  }, [session]);

  useEffect(() => {
    setMessages(sessions[session] ?? []);
    sessionRef.current = session;
  }, [session]);

  const setSession = (sessionId: string) => {
    if (isStreaming) return;
    setSessionId(sessionId);
    vscode.setState({ ...vscode.getState(), lastSession: sessionId });
  };

  const addSession = () => {
    if (isStreaming) return;
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
    if (isStreaming) return;
    vscode.postMessage({ command: COMMANDS.removeChatSession, value: sessionId });
    setSessions((prev) => {
      delete prev[sessionId];
      vscode.setState({ ...vscode.getState(), chatSession: prev });
      return { ...prev };
    });
  };

  const sendMessage = (data: Omit<ChatMessage, 'session' | 'id' | 'time' | 'from' | 'to'>) => {
    const message: ChatMessage = {
      ...data,
      id: uuid(7),
      from: Providers.user,
      to: provider,
      time: new Date(),
      session,
    };

    setSessions((s) => {
      const data = {
        ...s,
        [session]: [...s[session], message],
      };

      setMessages((prev) => [...prev, message]);
      vscode.postMessage({ command: COMMANDS.sendMessage, value: message });
      vscode.setState({ ...vscode.getState(), chatSession: data });

      return data;
    });
    if (provider === Providers.agent) {
      setIsAgentThinking(true);
    }
  };

  const sessionList = Object.keys(sessions)?.length ? Object.keys(sessions) : [session];

  const value = {
    messages: messages.concat(tmpMessage || []),
    addSession,
    setSession,
    session,
    sessions: sessionList.reverse(),
    sendMessage,
    removeSession,
    tmpMessage,
    isStreaming,
    setProvider,
    provider,
    isAgentThinking,
  };

  console.log('messages=========================', sessions);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
