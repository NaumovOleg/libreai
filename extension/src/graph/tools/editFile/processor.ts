import { Editor } from '@services';
import { EditFileToolArgs } from '@utils';

export const processor = async (instruction: EditFileToolArgs) => {
  const editor = new Editor(instruction);
  return editor.apply();
};
