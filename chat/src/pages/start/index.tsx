import './style.scss';

import Typography from '@mui/material/Typography';
import { AiConfig } from '../settings/components';
import { CONFIG_PARAGRAPH } from '@utils';

export const StartPage = () => {
  return (
    <section className="start-page">
      <div>
        <Typography variant="h1">Welcome to Robocode assistant</Typography>
        <Typography variant="h4">Before You start, you nedd to configure Your LLM</Typography>
      </div>
      <div style={{ marginTop: 32 }}>
        <AiConfig configType={CONFIG_PARAGRAPH.chatConfig} />
      </div>
    </section>
  );
};
