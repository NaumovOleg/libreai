import { FC } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

type Props = {
  label?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  value?: string;
  type?: 'text' | 'number';
};

export const Input: FC<Props> = ({ label, value = '', onChange, placeholder, type = 'text' }) => {
  return (
    <div>
      <FormControl variant="outlined">
        {label && <InputLabel>{label}</InputLabel>}
        <OutlinedInput
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value as string)}
        />
      </FormControl>
    </div>
  );
};
