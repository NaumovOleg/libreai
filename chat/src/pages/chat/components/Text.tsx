import { FC } from 'react';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Switch } from '@elements';
import { useChat } from '@hooks';

type Props = {
  value?: string;
  onChange: (message: string) => void;
  onPressEnter?: () => void;
};

export const TextArea: FC<Props> = ({ value, onChange, onPressEnter }) => {
  const { provider, setProvider } = useChat();
  console.log(provider, setProvider);
  return (
    <div className="ai-input">
      <TextareaAutosize
        maxRows={6}
        minRows={6}
        className="text-field"
        placeholder="Ask ai copilot"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            onPressEnter?.();
          }
        }}
      />
      <Switch />
    </div>
  );
};
