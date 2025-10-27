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
  MAX_MESSAGES,
} from '@utils';

const commands = [
  COMMANDS.agentResponse,
  COMMANDS.chatStreamEnd,
  COMMANDS.chatStream,
  COMMANDS.selectContext,
  COMMANDS.helperMessage,
];

export const ChatProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const vsCodeState = (vscode.getState() as State) ?? {};

  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setCatProvider] = useState<Author>(() => vsCodeState.provider ?? Author.chat);
  const [files, setFiles] = useState<string[]>([]);
  const [isAgentThinking, setIsAgentThinking] = useState(() => !!vsCodeState.isAgentThinking);

  const [tmpMessage, seTemporaryMessage] = useState<ChatMessage | undefined>();

  // messages state always holds the most recent MAX_MESSAGES
  const [messages, setMessages] = useState<(ChatMessage | AgentMessage)[]>(() => {
    if (vsCodeState?.session) {
      const trimmed = vsCodeState.session.slice(-MAX_MESSAGES);
      vscode.setState({ ...vscode.getState(), session: trimmed });
      return trimmed;
    }
    vscode.setState({ ...vscode.getState(), session: [] });
    return [];
  });

  // Utility to always trim to MAX_MESSAGES on addition
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
      if (event.data.type === COMMANDS.helperMessage) {
        updateMessages(event.data.payload);
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

  // Always only return up to MAX_MESSAGES in memory (plus tmpMessage if exists)
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
