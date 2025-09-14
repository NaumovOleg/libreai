import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import { ChatMessage, extractTextFromNode, rehypeCodeIndexPlugin } from '@utils';
import { MessageNavigation } from './MessageNavigation';
import { useChat } from '@hooks';
import { getMessageContent } from '../utils';

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
          rehypePlugins={[rehypeCodeIndexPlugin]}
          components={{
            code({ className, node, children }) {
              const codeText = extractTextFromNode(children).replace(/\n$/, '');
              const isCodeBlock = (className ?? '').includes('language-');
              const dataIndex = (node?.properties?.dataCodeIndex as number) ?? 0;
              const activeInstruction = message?.instructions?.[dataIndex];

              if (!isCodeBlock) {
                return <code className={className}>{codeText}</code>;
              }

              const match = /language-(\w+)/.exec(className || '');
              const lang = match?.[1] ?? 'text';

              return (
                <div className="code-block" style={{ position: 'relative' }}>
                  <MessageNavigation
                    onCopy={() => navigator.clipboard.writeText(codeText)}
                    onInteractInstruction={(state: any) =>
                      interactInstruction(message, state, activeInstruction?.id)
                    }
                    message={{
                      ...message,
                      instructions: activeInstruction ? [activeInstruction] : [],
                    }}
                  />

                  <SyntaxHighlighter
                    PreTag="pre"
                    language={lang}
                    style={atomOneDark}
                    showLineNumbers
                    startingLineNumber={activeInstruction?.startLine ?? 1}
                    wrapLines
                    lineNumberStyle={{
                      paddingRight: 0,
                      opacity: 0.5,
                      userSelect: 'none',
                      lineHeight: 1.4,
                      background: 'transparent !important',
                      marginRight: '10px',
                    }}
                    customStyle={{
                      background: 'transparent',
                      padding: 0,
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {codeText}
                  </SyntaxHighlighter>
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
