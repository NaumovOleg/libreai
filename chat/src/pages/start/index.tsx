import './style.scss';
import { Navigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { AiConfig } from '../settings/components';
import { CONFIG_PARAGRAPH } from '@utils';
import { useConfig } from '@hooks';

export const StartPage = () => {
  const { isConfigSetted } = useConfig();

  const needsAgent = !isConfigSetted[CONFIG_PARAGRAPH.agentConfig];
  const needsChat = !isConfigSetted[CONFIG_PARAGRAPH.chatConfig];
  if (!needsAgent && !needsChat) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <section className="start-page">
      <header className="start-page-header">
        <Typography variant="h2" align="center" className="start-page-title">
          Welcome to <span>Robocode Assistant</span>
        </Typography>
        <Typography variant="subtitle1" align="center" className="start-page-subtitle">
          Before you start, you need to configure your LLM provider
        </Typography>
      </header>
      <div className="start-page-config-blocks">
        {needsAgent && (
          <div className="start-page-config-block">
            <Typography variant="h1" className="config-block-title">
              Agent configuration
            </Typography>
            <AiConfig configType={CONFIG_PARAGRAPH.agentConfig} />
          </div>
        )}
        {needsChat && (
          <div className="start-page-config-block">
            <Typography variant="h1" className="config-block-title">
              Chat configuration
            </Typography>
            <AiConfig configType={CONFIG_PARAGRAPH.chatConfig} />
          </div>
        )}
        {!needsAgent && !needsChat && (
          <div className="start-page-config-block">
            <Typography variant="h5" className="config-block-title">
              All configuration complete!
            </Typography>
            <Typography variant="body1" className="all-config-complete-message">
              You have configured both agent and chat providers. Ready to start!
            </Typography>
          </div>
        )}
      </div>
    </section>
  );
};
