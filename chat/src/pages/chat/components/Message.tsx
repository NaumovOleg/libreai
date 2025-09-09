import { ChatMessage, extractTextFromNode } from '@utils';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { getMessageContent } from '../utils';
import { MessageNavigation } from './MessageNavigation';
import { useChat } from '@hooks';

type Props = {
  message: ChatMessage;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export const Message: FC<Props> = ({ message }) => {
  const { interactInstruction } = useChat();
  return (
    <div className={`message prose prose-invert ${message.from}`}>
      <div className="message-markdown">
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight]}
          components={{
            code({ className, children, ...props }) {
              const isCodeBlock = className?.includes('language-');

              const codeText = extractTextFromNode(children).trim();
              return (
                <div className="code-block">
                  {isCodeBlock && (
                    <MessageNavigation
                      onCopy={() => navigator.clipboard.writeText(codeText)}
                      onInteractInstruction={(
                        state: INSTRUCTION_STATE.accepted | INSTRUCTION_STATE.declined,
                      ) => interactInstruction(message, state)}
                      message={message}
                    />
                  )}

                  <code className={className} {...props}>
                    {children}
                  </code>
                </div>
              );
            },
          }}
        >
          {getMessageContent(message)}
        </ReactMarkdown>
      </div>
    </div>
  );
};
