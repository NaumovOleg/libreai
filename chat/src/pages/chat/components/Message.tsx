import { ChatMessage, extractTextFromNode, rehypeCodeIndexPlugin } from '@utils';
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
          rehypePlugins={[rehypeHighlight, rehypeCodeIndexPlugin]}
          components={{
            code({ className, node, children, ...props }) {
              const isCodeBlock = className?.includes('language-');
              const activeInstruction =
                message?.instructions?.[(node?.properties.dataCodeIndex as number) ?? 0];

              const codeText = extractTextFromNode(children).trim();

              return (
                <div className="code-block">
                  {isCodeBlock && (
                    <MessageNavigation
                      onCopy={() => navigator.clipboard.writeText(codeText)}
                      onInteractInstruction={(
                        state: INSTRUCTION_STATE.accepted | INSTRUCTION_STATE.declined,
                      ) => interactInstruction(message, state, activeInstruction?.id)}
                      message={{
                        ...message,
                        instructions: activeInstruction ? [activeInstruction] : [],
                      }}
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
