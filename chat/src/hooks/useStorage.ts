import { State, vscode } from '@utils';

export const useStorage = () => {
  const updateStorage = (data: Partial<State>) => {
    return vscode.setState({ ...vscode.getState(), ...data });
  };

  const getStorage = () => {
    return (vscode.getState() as State) ?? {};
  };

  return { updateStorage, getStorage };
};
