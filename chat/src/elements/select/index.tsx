import { FC } from 'react';
import MUISelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

type Props = {
  label?: string;
  items: { value: string; label: string }[];
  onChange: (value: string) => void;
  value?: string;
};

export const Select: FC<Props> = ({ label, items, value = '', onChange }) => {
  return (
    <div className="custom-select">
      <FormControl className="custom-select-container">
        {label && <InputLabel className="input-label">{label}</InputLabel>}
        <MUISelect
          className="custom-select"
          value={value}
          onChange={(e) => onChange(e.target.value as string)}
        >
          {items.map((item) => (
            <MenuItem value={item.value}>{item.label}</MenuItem>
          ))}
        </MUISelect>
      </FormControl>
    </div>
  );
};
