import ReactMarkdown from 'react-markdown';
import { FC } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import { extractTextFromNode, rehypeCodeIndexPlugin } from '@utils';
import remarkGfm from 'remark-gfm';

type Props = {
  text: string;
  type: 'code' | 'diff';
};

export const Code: FC<Props> = ({ text, type }) => {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeCodeIndexPlugin, remarkGfm]}
      components={{
        code({ className, children }) {
          const codeText = extractTextFromNode(children).replace(/\n$/, '');
          const isCodeBlock = (className ?? '').includes('language-');

          if (!isCodeBlock) {
            return <code className={className}>{codeText}</code>;
          }

          const match = /language-(\w+)/.exec(className || '');
          const lang = match?.[1] ?? 'text';

          // Handle diff view
          const isDiff = type === 'diff' || lang === 'diff';

          return (
            <div className="code-block" style={{ position: 'relative' }}>
              <SyntaxHighlighter
                PreTag="pre"
                language={isDiff ? 'diff' : lang}
                style={atomOneDark}
                showLineNumbers
                wrapLines
                lineProps={
                  isDiff
                    ? (lineNumber: number) => {
                        const lineContent = codeText.split('\n')[lineNumber - 1];
                        const style: React.CSSProperties = {
                          display: 'block',
                          padding: '2px 12px',
                          margin: '0 -12px',
                          width: '100vw',
                        };

                        if (lineContent?.startsWith('+')) {
                          style.backgroundColor = 'rgba(46, 160, 67, 0.15)';
                          style.borderLeft = '3px solid #2ea043';
                        } else if (lineContent?.startsWith('-')) {
                          style.backgroundColor = 'rgba(248, 81, 73, 0.15)';
                          style.borderLeft = '3px solid #f85149';
                        } else if (lineContent?.startsWith('@@')) {
                          style.backgroundColor = 'rgba(56, 139, 253, 0.15)';
                          style.fontStyle = 'italic';
                          style.color = '#58a6ff';
                        }

                        return { style };
                      }
                    : undefined
                }
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
                  padding: '12px',
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
      {text}
    </ReactMarkdown>
  );
};
