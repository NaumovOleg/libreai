import { FC, ReactNode } from 'react';
import { Tabs as MUITabs, Tab as MUITab, styled } from '@mui/material';

type Props = {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  tabs: { label: string; content: ReactNode }[];
};

const CustomTabsRoot = styled(MUITabs)({
  backgroundColor: 'var(--vscode-editor-background)',
  color: 'var(--vscode-tab-inactiveForeground)',
  minHeight: 28,
  minWidth: 10,
  '& .MuiTabs-indicator': {
    backgroundColor: 'var(--vscode-tab-activeBorder)',
    height: 2,
    transition: 'all 0.2s ease-in-out',
  },
});

const CustomTab = styled(MUITab)({
  textTransform: 'none',
  fontSize: '0.75rem',
  minHeight: 28,
  minWidth: 10,
  padding: '4px 10px',
  flex: '0 1 auto',
  '&.Mui-selected': {
    color: 'var(--vscode-tab-activeForeground)',
    backgroundColor: 'var(--vscode-tab-activeBackground)',
  },
  '&:hover': {
    backgroundColor: 'var(--vscode-tab-hoverBackground)',
  },
  transition: 'all 0.2s ease-in-out',
});

export const Tabs: FC<Props> = ({ value, onChange, tabs }) => {
  return (
    <div>
      <CustomTabsRoot value={value} onChange={onChange} variant="scrollable" scrollButtons="auto">
        {tabs.map((tab, index) => (
          <CustomTab key={index} label={tab.label} />
        ))}
      </CustomTabsRoot>
      <div style={{ marginTop: 8 }}>{tabs[value]?.content}</div>
    </div>
  );
};
