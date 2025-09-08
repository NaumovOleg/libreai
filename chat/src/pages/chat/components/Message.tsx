import { ChatMessage, Providers } from '@utils';
import { FC, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { RiRobot3Line } from 'react-icons/ri';
import Icon from '@mui/material/Icon';
import 'highlight.js/styles/github-dark.css';

type Props = {
  message: ChatMessage;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

const getMessageContent = (message: ChatMessage) => {
  if (message.instruction?.content) {
    return `
\`\`\`${message.instruction?.language}
${message.instruction.content}
\`\`\`

###`;
  }
  return message.text;
};

export const Message: FC<Props> = ({ message }) => {
  useEffect(() => {
    const blocks = document.querySelectorAll('pre > code');
    blocks.forEach((block) => {
      const pre = block.parentElement;
      if (!pre || pre.querySelector('.copy-btn')) return;

      const button = document.createElement('button');
      button.innerText = 'Copy';
      button.className =
        'copy-btn absolute top-1 right-1 bg-gray-700 text-white px-2 py-1 text-xs rounded hover:bg-gray-600';
      button.onclick = async () => {
        await navigator.clipboard.writeText(block.textContent || '');
        button.innerText = 'Copied!';
        setTimeout(() => (button.innerText = 'Copy'), 1500);
      };

      pre.style.position = 'relative';
      pre.appendChild(button);
    });
  }, [message.text]);

  return (
    <div className={`message prose prose-invert ${message.from}`}>
      <div className="message-markdown">
        <div className="message-header">
          {message.from === Providers.agent && (
            <div>
              <Icon>
                <RiRobot3Line />
              </Icon>
            </div>
          )}
        </div>
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {getMessageContent(message)}
        </ReactMarkdown>
      </div>
    </div>
  );
};
