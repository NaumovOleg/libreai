import { FC } from 'react';
import TextareaAutosize from '@mui/material/TextareaAutosize';

type Props = {
  value: string;
  onChange: (message: string) => void;
};

export const TextArea: FC<Props> = ({ value, onChange }) => {
  return (
    <TextareaAutosize
      maxRows={6}
      minRows={6}
      className="text-field"
      placeholder="Ask ai copilot"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      // onKeyDown={}
    />
  );
};
