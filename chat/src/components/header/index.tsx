import './styles.scss';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const showBackButton = !['/', '/chat'].includes(location.pathname);

  return (
    <AppBar className="header">
      <Toolbar className="toolbar">
        <Box sx={{ flexGrow: 1 }}>
          {showBackButton && (
            <IconButton onClick={() => navigate('/')} className="button-container" color="inherit">
              <ArrowBack />
            </IconButton>
          )}
        </Box>
        <IconButton
          onClick={() => navigate('/settings')}
          className="button-container"
          color="inherit"
        >
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
