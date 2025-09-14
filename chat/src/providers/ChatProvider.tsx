import { useState, type FC, type ReactElement, useEffect, useRef } from 'react';
import { ChatContext } from './context';
import {
  State,
  ChatMessage,
  vscode,
  uuid,
  COMMANDS,
  Providers,
  INSTRUCTION_STATE,
  globalListener,
  USER_ACTIONS_ON_MESSAGE,
} from '@utils';
const updateInstructionsState = (
  instructions: AgentInstruction[],
  state: INSTRUCTION_STATE,
  id?: string,
) => {
  return instructions.map((instruction) => {
    if (!id || id === instruction.id) {
      return { ...instruction, state };
    }
    return { ...instruction };
  });
};

export const ChatProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const vsCodeState = vscode.getState() as State;

  const [sessions, setSessions] = useState(() => {
    if (vsCodeState?.chatSession) return vsCodeState?.chatSession;
    const newSession = { [uuid()]: [] };
    vscode.setState({ chatSession: newSession });
    return newSession;
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setCatProvider] = useState<Providers>(
    () => vsCodeState.provider ?? Providers.ai,
  );
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

    const commands = [COMMANDS.agentResponse, COMMANDS.chatStreamEnd, COMMANDS.chatStream];
    globalListener.subscribe(commands, handler);
    return () => {
      globalListener.unsubscribe(commands, handler);
    };
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

  const interactInstruction = (
    data: ChatMessage,
    state: INSTRUCTION_STATE.accepted | INSTRUCTION_STATE.declined,
    id?: string,
  ) => {
    setSessions((s) => {
      const chatSession = s[session].map((msg) => {
        if (msg.id !== data.id) return { ...msg };

        const msData = { ...msg };
        if (msData.instructions) {
          msData.instructions = updateInstructionsState(msData.instructions, state, id);
        }
        return msData;
      });
      s[session] = [...chatSession];

      vscode.setState({ ...vscode.getState(), chatSession: s });

      return s;
    });
    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg.id !== data.id || !msg.instructions?.length) return msg;
        return {
          ...msg,
          instructions: updateInstructionsState(msg.instructions, state, id),
        };
      });
    });

    if (state !== INSTRUCTION_STATE.accepted) return;

    const instructions = updateInstructionsState(data.instructions ?? [], state, id);

    const message: ChatMessage = {
      id: uuid(7),
      from: Providers.user,
      to: provider,
      time: new Date(),
      session,
      text: USER_ACTIONS_ON_MESSAGE.runInstructions,
      instructions: id ? instructions.filter((el) => el.id === id) : instructions,
    };

    vscode.postMessage({ command: COMMANDS.sendMessage, value: message });
  };

  const setProvider = (provider: Providers) => {
    setCatProvider(provider);
    vscode.setState({ ...vscode.getState(), provider });
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
    interactInstruction,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
