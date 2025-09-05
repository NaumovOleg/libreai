import { useState, type FC, type ReactElement } from 'react';
import { ChatContext } from './context';
import { State, ChatMessage, vscode } from '@utils';

export const ChatProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [sessions, setSessions] = useState(() => {
    const { chatSession } = vscode.getState() as State;
    return chatSession ?? {};
  });

  const sendMessage = (session: string, message: ChatMessage) => {
    setSessions((s) => {
      s[session] = [...s[session], message];
      vscode.setState({
        ...(vscode.getState() as State),
        chatSession: s,
      });
      return s;
    });
  };

  return <ChatContext.Provider value={{ sessions, sendMessage }}>{children}</ChatContext.Provider>;
};
