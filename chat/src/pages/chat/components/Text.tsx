import { useState } from 'react';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { FileIcon } from '@elements';
import { useChat } from '@hooks';
import { vscode, COMMANDS } from '@utils';
import { BottomNavigation } from './BottomNavigation';

export const TextArea = () => {
  const { files, sendMessage } = useChat();
  const [message, setMessage] = useState<string | undefined>();
  const onOpenContextSelect = () => {
    vscode.postMessage({ command: COMMANDS.selectContext });
  };
  return (
    <div className="ai-input">
      <div className="chat-input">
        <button onClick={onOpenContextSelect} className="add-context-button">
          📎 add files
        </button>
        <div className="files">
          {files.map((el) => (
            <FileIcon path={el} />
          ))}
        </div>
      </div>
      <TextareaAutosize
        maxRows={6}
        minRows={6}
        className="text-field"
        placeholder="Ask ai copilot"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            sendMessage({ text: message ?? '' });
            setMessage(undefined);
          }
        }}
      />

      <BottomNavigation
        sendMessage={() => {
          sendMessage({ text: message ?? '' });
          setMessage(undefined);
        }}
      />
    </div>
  );
};
