import { FC } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

type Props = {
  label?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  value?: string;
};

export const Input: FC<Props> = ({ label, value = '', onChange, placeholder }) => {
  return (
    <div>
      <FormControl variant="outlined">
        {label && <InputLabel>{label}</InputLabel>}
        <OutlinedInput
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value as string)}
        />
      </FormControl>
    </div>
  );
};
