import { useState, type FC, type ReactElement, useEffect } from 'react';
import { ChatContext } from './context';
import {
  State,
  ChatMessage,
  vscode,
  uuid,
  COMMANDS,
  Author,
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
  const vsCodeState = (vscode.getState() as State) ?? {};

  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setCatProvider] = useState<Author>(() => vsCodeState.provider ?? Author.chat);
  const [files, setFiles] = useState<string[]>([]);
  const [isAgentThinking, setIsAgentThinking] = useState(() => !!vsCodeState.isAgentThinking);

  const [tmpMessage, seTemporaryMessage] = useState<ChatMessage | undefined>();

  const [messages, setMessages] = useState<(ChatMessage | AgentMessage)[]>(() => {
    if (vsCodeState?.session) return vsCodeState?.session;
    vscode.setState({ ...vscode.getState(), session: [] });
    return [];
  });

  const updateMessages = (message: ChatMessage | AgentMessage) => {
    setMessages((prev) => {
      const found = prev.find((el) => el.id === message.id);
      const newMessage = { ...found, ...message };

      const data = found
        ? prev.map((el) => (el.id === message.id ? newMessage : el))
        : prev.concat(newMessage);

      vscode.setState({ ...vscode.getState(), session: data });
      return data;
    });
  };

  const updateLastMessage = (message: ChatMessage) => {
    setIsStreaming(false);
    updateMessages(message);
  };

  const updateAgentMessages = (message: AgentMessage) => {
    updateMessages(message);

    if (message.status === 'done' && message.type === 'agentResponse') {
      setIsAgentThinking(false);
      vscode.setState({ ...vscode.getState(), isAgentThinking: false });
    }
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
        const files = event.data.payload as { path: string }[];
        setFiles(files.map((el) => el.path));
      }
    };

    globalListener.subscribe(commands, handler);
    return () => globalListener.unsubscribe(commands, handler);
  }, []);

  const clearSession = () => {
    setMessages([]);
    setIsAgentThinking(false);

    vscode.setState({ ...vscode.getState(), session: [], isAgentThinking: false });
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
      vscode.setState({ ...vsCodeState, isAgentThinking: true });
    }
  };

  const setProvider = (provider: Author) => {
    setCatProvider(provider);
    vscode.setState({ ...vscode.getState(), provider });
  };

  const value = {
    messages: messages.concat(tmpMessage || []),
    sendMessage,
    clearSession,
    tmpMessage,
    isStreaming,
    setProvider,
    provider,
    isAgentThinking,
    files,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
