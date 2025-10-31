import './style.scss';

import Typography from '@mui/material/Typography';

export const StartPage = () => {
  return (
    <section className="start-page">
      <div>
        <Typography variant="h1">Welcome to Robocode assistant</Typography>
        <Typography variant="h4">Before You start, you nedd to configure Your LLM</Typography>
      </div>
    </section>
  );
};
