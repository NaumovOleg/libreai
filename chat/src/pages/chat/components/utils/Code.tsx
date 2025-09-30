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
export const Code: FC<Props> = ({ text }) => {
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
      {text}
    </ReactMarkdown>
  );
};
