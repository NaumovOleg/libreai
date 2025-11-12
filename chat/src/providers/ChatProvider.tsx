import { useState, type FC, type ReactElement, useEffect } from 'react';
import { ChatContext } from './context';
import {
  ChatMessage,
  vscode,
  uuid,
  COMMANDS,
  Author,
  globalListener,
  AgentMessage,
  MAX_MESSAGES,
  FilePath,
} from '@utils';
import { useStorage } from '@hooks';
const commands = [
  COMMANDS.agentResponse,
  COMMANDS.chatStreamEnd,
  COMMANDS.chatStream,
  COMMANDS.selectContext,
  COMMANDS.helperMessage,
  COMMANDS.restoreAgentSession,
];

export const ChatProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const { updateStorage, getStorage } = useStorage();

  const vsCodeState = getStorage();

  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setChatProvider] = useState<Author>(() => vsCodeState.provider ?? Author.chat);
  const [files, setFiles] = useState<FilePath[]>([]);
  const [isAgentThinking, setIsAgentThinking] = useState(() => !!vsCodeState.isAgentThinking);

  const [tmpMessage, seTemporaryMessage] = useState<ChatMessage | undefined>();

  const [messages, setMessages] = useState<(ChatMessage | AgentMessage)[]>(() => {
    if (vsCodeState?.session) {
      const trimmed = vsCodeState.session.slice(-MAX_MESSAGES);
      updateStorage({ session: trimmed });
      return trimmed;
    }
    updateStorage({ session: [] });
    return [];
  });

  useEffect(() => {
    if (vsCodeState.isAgentThinking) {
      vscode.postMessage({ command: COMMANDS.restoreAgentSession });
    }
  }, []);

  const capMessages = (arr: (ChatMessage | AgentMessage)[]): (ChatMessage | AgentMessage)[] => {
    return arr.length > MAX_MESSAGES ? arr.slice(-MAX_MESSAGES) : arr;
  };

  const updateMessages = (message: ChatMessage | AgentMessage) => {
    setMessages((prev) => {
      const found = prev.find((el) => el.id === message.id);
      const newMessage = { ...found, ...message };

      let data = found
        ? prev.map((el) => (el.id === message.id ? newMessage : el))
        : prev.concat(newMessage);

      data = capMessages(data);

      updateStorage({ session: data });

      return data;
    });
  };

  const updateLastMessage = (message: ChatMessage) => {
    setIsStreaming(false);
    updateMessages(message);
  };

  const updateAgentMessages = (message: AgentMessage) => {
    updateMessages(message);

    if (['done', 'error'].includes(message.status) && message.type === 'agentResponse') {
      setIsAgentThinking(false);
      updateStorage({ isAgentThinking: false });
    }
  };

  const restoreAgentSession = (messages: AgentMessage[]) => {
    const agentSession = messages[0]?.session;
    if (!agentSession) return;

    const terminator = messages.find(
      (message) => ['done', 'error'].includes(message.status) && message.type === 'agentResponse',
    );

    if (terminator) {
      setIsAgentThinking(false);
      updateStorage({ isAgentThinking: false });
    }

    setMessages((prev) => {
      const filterBc = (ms: AgentMessage | ChatMessage) => {
        if (!('session' in ms)) return false;
        return ms.session === agentSession;
      };
      const start = prev.findIndex(filterBc);
      const end = prev.findLastIndex(filterBc);
      if (start === -1 || end === -1) return prev;

      const newMessages = [...prev];
      newMessages.splice(start, end - start + 1, ...messages);

      updateStorage({ session: newMessages });

      return newMessages;
    });
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
        updateAgentMessages(event.data.payload as AgentMessage);
      }
      if (event.data.type === COMMANDS.selectContext) {
        const files = event.data.payload as FilePath[];
        setFiles(files.map((el) => el));
      }
      if (event.data.type === COMMANDS.helperMessage) {
        updateMessages(event.data.payload);
      }
      if (event.data.type === COMMANDS.restoreAgentSession) {
        restoreAgentSession(event.data.payload);
      }
    };

    globalListener.subscribe(commands, handler);
    return () => globalListener.unsubscribe(commands, handler);
  }, []);

  const clearSession = () => {
    setMessages([]);
    setIsAgentThinking(false);

    updateStorage({ session: [], isAgentThinking: false });

    vscode.postMessage({ command: COMMANDS.removeChatSession });
  };

  const sendMessage = (data: Omit<ChatMessage, 'session' | 'id' | 'time' | 'from' | 'to'>) => {
    const message: ChatMessage = {
      ...data,
      id: uuid(7),
      from: Author.user,
      to: provider,
      time: new Date(),
      files,
    };

    updateMessages(message);
    vscode.postMessage({ command: COMMANDS.sendMessage, value: message });

    if (provider === Author.agent) {
      setIsAgentThinking(true);
      updateStorage({ isAgentThinking: true });
    }
  };

  const setProvider = (provider: Author) => {
    setChatProvider(provider);
    updateStorage({ provider });
  };

  const displayMessages = [...messages, ...(tmpMessage ? [tmpMessage] : [])];
  const value = {
    messages: displayMessages.slice(-MAX_MESSAGES),
    sendMessage,
    clearSession,
    tmpMessage,
    isStreaming,
    setProvider,
    provider,
    isAgentThinking,
    files,
  };

  console.log('MESSAGES', value.messages);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
