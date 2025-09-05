import MUIButton from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { FC } from 'react';

const CustomButton = styled(MUIButton)(() => ({
  backgroundColor: 'var(--vscode-button-background)',
  color: 'var(--vscode-button-foreground)',
  padding: '8px 16px',
  borderRadius: 6,
  textTransform: 'none',
  boxShadow: 'none',
  height: 30,
  border: '1px solid var(--vscode-button-border)',

  '&:hover': {
    backgroundColor: 'var(--vscode-button-hoverBackground)',
  },
  '&:active': {
    backgroundColor: 'var(--vscode-button-activeBackground)',
  },
  '&:disabled': {
    backgroundColor: 'var(--vscode-button-disabledBackground)',
    color: 'var(--vscode-button-background)',
  },
}));

type Props = {
  onClick: () => void;
  label: string;
  disabled?: boolean;
};

export const Button: FC<Props> = ({ onClick, label, disabled }) => {
  return (
    <CustomButton disabled={!!disabled} onClick={onClick}>
      {label}
    </CustomButton>
  );
};
