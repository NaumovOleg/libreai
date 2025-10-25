import { AGENT_TOOLS, ToolCallbacks } from '../../utils';
import { commandCb } from './command';
import { createFileCb } from './createFile';
import { deleteFileCb } from './deleteFile';
import { editFileCb } from './editFile';
import { readFileCb } from './readFile';
import { renameFileCb } from './renameFile';
import { searchEmbeddingsCb } from './searchEmbeddings';

export const callbacks: Omit<ToolCallbacks, 'planning'> = {
  [AGENT_TOOLS.command]: commandCb,
  [AGENT_TOOLS.createFile]: createFileCb,
  [AGENT_TOOLS.deleteFile]: deleteFileCb,
  [AGENT_TOOLS.editFile]: editFileCb,
  [AGENT_TOOLS.readFile]: readFileCb,
  [AGENT_TOOLS.renameFile]: renameFileCb,
  [AGENT_TOOLS.searchEmbeddings]: searchEmbeddingsCb,
};
