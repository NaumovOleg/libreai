import './style.scss';
import { ReactElement, FC } from 'react';
import Button from '@mui/material/Button';
import Popper, { PopperPlacementType } from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import { usePopupState, Variant, bindToggle, bindPopper } from 'material-ui-popup-state/hooks';
import { Typography } from '@mui/material';

type Props = {
  children: ReactElement;
  variant?: Variant;
  placement?: PopperPlacementType;
  label: string;
};

export const Popup: FC<Props> = ({ label, children, variant = 'dialog', placement = 'top' }) => {
  const popupState = usePopupState({ variant: variant, popupId: 'popup-popper' });

  return (
    <div className="popup">
      <Popper {...bindPopper(popupState)} transition placement={placement}>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper onClick={() => popupState.close()}>{children}</Paper>
          </Fade>
        )}
      </Popper>
      <Button size="small" className="button" variant="contained" {...bindToggle(popupState)}>
        <Typography>{label}</Typography>
      </Button>
    </div>
  );
};
