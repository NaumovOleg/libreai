import { useState, type FC, type ReactElement, useEffect, useRef } from 'react';
import { ChatContext } from './context';
import {
  State,
  ChatMessage,
  vscode,
  uuid,
  COMMANDS,
  Providers,
  globalListener,
  AgentMessage,
} from '@utils';

const commands = [
  COMMANDS.agentResponse,
  COMMANDS.chatStreamEnd,
  COMMANDS.chatStream,
  COMMANDS.selectContext,
];

export const ChatProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const vsCodeState = vscode.getState() as State;

  const [sessions, setSessions] = useState(() => {
    if (vsCodeState?.chatSession) return vsCodeState?.chatSession;
    const newSession = { [uuid()]: [] };
    vscode.setState({ ...vscode.getState(), chatSession: newSession });
    return newSession;
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setCatProvider] = useState<Providers>(
    () => vsCodeState.provider ?? Providers.ai,
  );
  const [files, setFiles] = useState<string[]>([]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  const [tmpMessage, seTemporaryMessage] = useState<ChatMessage | undefined>();
  const [tmpAgentMessage, setTmpAgentMessage] = useState<AgentMessage | undefined>();

  const [messages, setMessages] = useState<(ChatMessage | AgentMessage)[]>([]);
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
    setMessages((prev) => [...prev, message as ChatMessage]);
  };

  const updateAgentMessages = (message: AgentMessage) => {
    if (message.status === 'pending') {
      return setTmpAgentMessage(message);
    }
    const newMessage = { ...tmpAgentMessage, ...message };
    setTmpAgentMessage(undefined);
    setMessages((prev) => prev.concat(newMessage));
    setSessions((chatSession) => {
      const data = {
        ...chatSession,
        [sessionRef.current]: chatSession[sessionRef.current].concat(newMessage),
      };
      vscode.setState({ ...vscode.getState(), chatSession: data });
      return data;
    });
    if (message.status === 'done' && message.type === 'agentResponse') {
      setIsAgentThinking(false);
    }
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      console.log('RECEIVED_MESSSAGE chat provider 86', event.data);
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
        updateAgentMessages(event.data.payload as AgentMessage);
      }
      if (event.data.type === COMMANDS.selectContext) {
        const files = event.data.payload as { path: string }[];
        setFiles(files.map((el) => el.path));
      }
    };

    globalListener.subscribe(commands, handler);
    return () => globalListener.unsubscribe(commands, handler);
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
      files,
    };

    setSessions((s) => {
      const sessionData = {
        ...s,
        [session]: [...s[session], message],
      };

      setMessages((prev) => [...prev, message]);
      vscode.postMessage({ command: COMMANDS.sendMessage, value: message });
      vscode.setState({ ...vscode.getState(), chatSession: sessionData });

      return sessionData;
    });
    if (provider === Providers.agent) {
      setIsAgentThinking(true);
    }
  };

  const setProvider = (provider: Providers) => {
    setCatProvider(provider);
    vscode.setState({ ...vscode.getState(), provider });
  };

  const sessionList = Object.keys(sessions)?.length ? Object.keys(sessions) : [session];

  const value = {
    messages: messages.concat(tmpMessage || []).concat(tmpAgentMessage || []),
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
    files,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
