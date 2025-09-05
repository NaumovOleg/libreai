import { Select, Input } from '@elements';
import { AI_PROVIDERS } from '@utils';
import { Fragment, useState } from 'react';
import Typography from '@mui/material/Typography';

const ProviderOptions = Object.entries(AI_PROVIDERS).map(([value, label]) => ({ value, label }));

export const Provider = () => {
  const [provider, setProvider] = useState<string>();
  const [model, setModel] = useState<string>();

  return (
    <div className="provider-container">
      <Typography variant="body1">Please provider:</Typography>
      <Select label="Provider" value={provider} items={ProviderOptions} onChange={setProvider} />
      {provider && (
        <Fragment>
          <Typography variant="body1">Please select model:</Typography>
          <Input label="Model" value={model} onChange={setModel} />
        </Fragment>
      )}
    </div>
  );
};
