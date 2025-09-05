import { Select, Input, Button } from '@elements';
import { AI_PROVIDERS } from '@utils';
import { Fragment, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { CONFIG_PARAGRAPH, ChatConfig } from '@utils';
import { useConfig } from '@hooks';

const ProviderOptions = Object.entries(AI_PROVIDERS).map(([value, label]) => ({ value, label }));

export const Chat = () => {
  const { chatConfig, setChatConfig, applyChanges } = useConfig();

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data.type === CONFIG_PARAGRAPH.chatConfig) {
        setChatConfig(event.data.payload as ChatConfig);
      }
    });
  }, []);

  return (
    <div className="provider-container">
      <Typography variant="body1">Please provider:</Typography>
      <Select
        label="Provider"
        value={chatConfig?.provider}
        items={ProviderOptions}
        onChange={(provider) => setChatConfig({ provider: provider as ChatConfig['provider'] })}
      />
      {chatConfig?.provider && (
        <Fragment>
          <Typography variant="body1">Please select model:</Typography>
          <Input
            label="Model"
            value={chatConfig?.model}
            onChange={(model) => setChatConfig({ model })}
          />
        </Fragment>
      )}
      <Button
        onClick={applyChanges}
        disabled={!chatConfig?.provider || !chatConfig?.model}
        label="Save"
      />
    </div>
  );
};
