import './style.scss';
import { Tabs } from '@elements';

import { useState } from 'react';
import Typography from '@mui/material/Typography';
import { Chat } from './components';

export const Settings = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const tabItems = [
    { label: 'Chat', content: <Chat /> },
    { label: 'Tab 2', content: <div>Content for Tab 2</div> },
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
