import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import { ChatMessage, extractTextFromNode, rehypeCodeIndexPlugin } from '@utils';
import { getMessageContent } from '../utils';

type Props = {
  message: ChatMessage;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export const Message: FC<Props> = ({ message }) => {
  return (
    <div className={`message prose prose-invert ${message.from}`}>
      <div className="message-markdown">
        <ReactMarkdown
          rehypePlugins={[rehypeCodeIndexPlugin]}
          components={{
            code({ className, children }) {
              const codeText = extractTextFromNode(children).replace(/\n$/, '');
              const isCodeBlock = (className ?? '').includes('language-');

              if (!isCodeBlock) {
                return <code className={className}>{codeText}</code>;
              }

              const match = /language-(\w+)/.exec(className || '');
              const lang = match?.[1] ?? 'text';

              return (
                <div className="code-block" style={{ position: 'relative' }}>
                  <SyntaxHighlighter
                    PreTag="pre"
                    language={lang}
                    style={atomOneDark}
                    showLineNumbers
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
