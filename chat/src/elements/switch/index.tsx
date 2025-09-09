import FormControlLabel from '@mui/material/FormControlLabel';
import SwitchLabels from '@mui/material/Switch';
import { FC } from 'react';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const Switch: FC<Props> = ({ label, checked, onChange }) => {
  return (
    <FormControlLabel
      sx={{
        width: 'fitContent',
        margin: 0,
      }}
      control={
        <SwitchLabels
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          size="small"
          defaultChecked
        />
      }
      label={label}
    />
  );
};
