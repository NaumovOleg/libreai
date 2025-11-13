import { useState } from 'react';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { FileIcon } from '@elements';
import { useChat } from '@hooks';
import { vscode, COMMANDS } from '@utils';
import { BottomNavigation } from './BottomNavigation';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

export const TextArea = () => {
  const { files, sendMessage, deleteFile } = useChat();
  const [text, setText] = useState<string>('');
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
            <div className="file-block">
              <FileIcon path={el.relative} />
              <IconButton onClick={() => deleteFile(el.absolute)} className="delete-file-button">
                <DeleteIcon />
              </IconButton>
            </div>
          ))}
        </div>
      </div>
      <TextareaAutosize
        maxRows={6}
        minRows={6}
        className="text-field"
        placeholder="Ask ai copilot"
        value={text.trim() ? text : ''}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !!text.trim()) {
            sendMessage({ text });
            setText('');
          }
        }}
      />

      <BottomNavigation
        sendMessage={() => {
          if (!text.trim()) return;
          sendMessage({ text });
          setText('');
        }}
      />
    </div>
  );
};
