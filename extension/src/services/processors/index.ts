import { AGENT_TOOLS, ToolCallbacks } from '../../utils';
import { command } from './command';
import { createFile } from './createFile';
import { deleteFile } from './deleteFile';
import { editFile } from './editFile';
import { readFile } from './readFile';
import { renameFile } from './renameFile';

export const Callbacks: ToolCallbacks = {
  [AGENT_TOOLS.commang]: command,
  [AGENT_TOOLS.createFile]: createFile,
  [AGENT_TOOLS.deleteFile]: deleteFile,
  [AGENT_TOOLS.editFile]: editFile,
  [AGENT_TOOLS.readFile]: readFile,
  [AGENT_TOOLS.renameFile]: renameFile,
};
