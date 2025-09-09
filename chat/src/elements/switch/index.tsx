import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import SwitchLabels from '@mui/material/Switch';

export const Switch = () => {
  return (
    <FormGroup>
      <FormControlLabel control={<SwitchLabels defaultChecked />} label="Label" />
    </FormGroup>
  );
};
