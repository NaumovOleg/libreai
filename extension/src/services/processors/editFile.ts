import { Editor } from '../../services';
import { EditFileToolArgs } from '../../utils';

export const editFileCb = async (instruction: EditFileToolArgs) => {
  const editor = new Editor(instruction);
  await editor.apply();

  return instruction.content;
};
