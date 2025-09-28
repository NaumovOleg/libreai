import './style.scss';
import { Tabs } from '@elements';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import { AiConfig } from './components';
import { CONFIG_PARAGRAPH } from '@utils';

export const Settings = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const tabItems = [
    { label: 'Chat', content: <AiConfig configType={CONFIG_PARAGRAPH.chatConfig} /> },
    { label: 'Agent', content: <AiConfig configType={CONFIG_PARAGRAPH.agentConfig} /> },
    {
      label: 'Autocomplete',
      content: <AiConfig configType={CONFIG_PARAGRAPH.autoCompleteConfig} />,
    },
    { label: 'Tab 3', content: <div>Content for Tab 3</div> },
  ];

  return (
    <section className="settings">
      <Typography className="header" variant="h2">
        Settings
      </Typography>
      <div className="settings-container">
        <Tabs value={tabIndex} onChange={handleTabChange} tabs={tabItems} />
      </div>
    </section>
  );
};
