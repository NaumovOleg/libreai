import { EditFileToolArgs } from '@utils';

import { Editor } from '../editor';

export const editFileCb = async (instruction: EditFileToolArgs) => {
  const editor = new Editor(instruction);
  return editor.apply();
};
