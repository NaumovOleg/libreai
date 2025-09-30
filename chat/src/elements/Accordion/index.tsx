import './style.scss';
import { FC, useState } from 'react';
import MUIAccordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

type AccordionItem = {
  id: string;
  title: string | React.ReactNode;
  content: React.ReactNode;
};

type Props = {
  items: AccordionItem[];
  defaultExpanded?: string;
  disabled?: boolean;
  allowMultiple?: boolean;
};

export const Accordion: FC<Props> = ({
  items,
  defaultExpanded,
  disabled = false,
  allowMultiple = false,
}) => {
  const [expanded, setExpanded] = useState<string | false>(defaultExpanded || false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    if (allowMultiple) {
      console.log(event);
      // For multiple expanded panels, you might want different state management
      setExpanded(isExpanded ? panel : false);
    } else {
      setExpanded(isExpanded ? panel : false);
    }
  };

  return (
    <div className="accordion-section">
      {items.map((item) => (
        <MUIAccordion
          key={item.id}
          expanded={expanded === item.id}
          onChange={handleChange(item.id)}
          disabled={disabled}
          className="accordion"
          slotProps={{
            transition: { unmountOnExit: true },
          }}
        >
          <AccordionSummary
            sx={{ minHeight: 0 }}
            expandIcon={<ExpandMoreIcon />}
            className="accordionSummary"
            classes={{ content: 'content', expandIconWrapper: 'expandIconWrapper' }}
          >
            <Typography className="typography">{item.title}</Typography>
          </AccordionSummary>

          <AccordionDetails className="accordionDetails">
            {typeof item.content === 'string' ? (
              <Typography className="typography content">{item.content}</Typography>
            ) : (
              item.content
            )}
          </AccordionDetails>
        </MUIAccordion>
      ))}
    </div>
  );
};
