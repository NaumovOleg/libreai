import { Select, Input, Button } from '@elements';
import { AI_PROVIDERS } from '@utils';
import { Fragment, FC } from 'react';
import Typography from '@mui/material/Typography';
import { CONFIG_PARAGRAPH, AiConfigT } from '@utils';
import { useConfig } from '@hooks';

const ProviderOptions = Object.entries(AI_PROVIDERS).map(([value, label]) => ({ value, label }));
type Props = {
  configType: CONFIG_PARAGRAPH;
};
export const AiConfig: FC<Props> = ({ configType }) => {
  const config = useConfig();
  const { setConfig, applyChanges } = config;
  const settings = config[configType];

  return (
    <div className="provider-container">
      <Typography variant="body1">Please select provider:</Typography>
      <Select
        value={settings?.provider}
        items={ProviderOptions}
        onChange={(provider) =>
          setConfig(configType, { provider: provider as AiConfigT['provider'] })
        }
      />

      <Fragment>
        <Typography variant="body1">Please enter model:</Typography>
        <Input
          placeholder="Model"
          value={settings?.model}
          onChange={(model) => setConfig(configType, { model })}
        />
      </Fragment>
      <Fragment>
        <Typography variant="body1">Please enter endpoint:</Typography>
        <Input
          placeholder="Endpoint"
          value={settings?.endpoint}
          onChange={(endpoint) => setConfig(configType, { endpoint })}
        />
      </Fragment>
      <Fragment>
        <Typography variant="body1">Please enter api key:</Typography>
        <Input
          placeholder="Api key"
          value={settings?.apiKey}
          onChange={(apiKey) => setConfig(configType, { apiKey })}
        />
      </Fragment>
      <Fragment>
        <Typography variant="body1">Please enter max tokens:</Typography>
        <Input
          placeholder="Max tokens"
          value={settings?.maxTokens + ''}
          onChange={(maxTokens) => setConfig(configType, { maxTokens: +maxTokens })}
        />
      </Fragment>
      <Fragment>
        <Typography variant="body1">Please enter max temperature:</Typography>
        <Input
          placeholder="Max tokens"
          value={settings?.temperature + ''}
          onChange={(temperature) => setConfig(configType, { temperature: +temperature })}
        />
      </Fragment>

      <Button
        onClick={() => applyChanges(configType)}
        disabled={!settings?.provider || !settings?.model}
        label="Save"
      />
    </div>
  );
};
