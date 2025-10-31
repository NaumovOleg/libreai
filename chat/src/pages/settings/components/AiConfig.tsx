import { Select, Input, Button } from '@elements';
import {
  AI_PROVIDERS,
  OPEN_AI_AGENT_MODELS,
  OPEN_AI_CHAT_MODELS,
  CONFIG_PARAGRAPH,
  AiConfigT,
} from '@utils';
import { Fragment, FC, useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useConfig } from '@hooks';

const ProviderOptions = Object.entries(AI_PROVIDERS).map(([value, label]) => ({ value, label }));
type Props = {
  configType: CONFIG_PARAGRAPH;
};

function shallowEqual(objA: any, objB: any) {
  if (objA === objB) return true;
  if (!objA || !objB) return false;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (objA[key] !== objB[key]) return false;
  }
  return true;
}

export const AiConfig: FC<Props> = ({ configType }) => {
  const config = useConfig();
  const { setConfig, applyChanges } = config;
  const settings = config[configType];
  const [original, setOriginal] = useState(settings);
  const [changed, setChanged] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep the original config in sync with settings loaded from parent/context
  useEffect(() => {
    setOriginal(settings);
  }, [configType]);

  // Detect changes
  useEffect(() => {
    setChanged(!shallowEqual(settings, original));
  }, [settings, original]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSave = () => {
    applyChanges(configType);
    setShowSaved(true);
    setChanged(false);
    setOriginal({ ...settings });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowSaved(false), 1500);
  };

  // Prepare OpenAI model items
  let openaiModels: { value: string; label: string }[] = [];
  if (settings?.provider === 'openai') {
    const modelObj =
      configType === CONFIG_PARAGRAPH.agentConfig ? OPEN_AI_AGENT_MODELS : OPEN_AI_CHAT_MODELS;
    openaiModels = Object.entries(modelObj).map(([label, value]) => ({ label, value }));
  }

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
        {settings?.provider === 'openai' ? (
          <Select
            value={settings?.model}
            items={openaiModels}
            onChange={(model) => setConfig(configType, { model })}
          />
        ) : (
          <Input
            placeholder="Model"
            value={settings?.model}
            onChange={(model) => setConfig(configType, { model })}
          />
        )}
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
      {configType === CONFIG_PARAGRAPH.autoCompleteConfig && (
        <Fragment>
          <Typography variant="body1">Autocomplete delay ms. (use 0 to turn off)</Typography>
          <Input
            placeholder="autocomplete"
            type="number"
            value={settings?.autocompleteDeleay + ''}
            onChange={(temperature) => setConfig(configType, { autocompleteDeleay: +temperature })}
          />
        </Fragment>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
        <Button
          onClick={handleSave}
          disabled={!changed || !settings?.provider || !settings?.model}
          label={showSaved ? 'Saved!' : 'Save'}
        />
        {showSaved && (
          <span style={{ color: '#08c', fontSize: 14, marginLeft: 8 }}>Changes applied</span>
        )}
      </div>
    </div>
  );
};
