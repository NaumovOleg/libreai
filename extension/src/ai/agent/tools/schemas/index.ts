import { AGENT_TOOLS } from '../../../../utils';
import { CommandSchema } from './command';
import { CreateFileSchema } from './createFile';
import { DeleteFileSchema } from './deleteFile';
import { EditFileSchema } from './editFile';
import { ReadFileSchema } from './readFile';
import { RenameFileSchema } from './renameFile';

export * from './command';
export * from './deleteFile';
export * from './editFile';
export * from './readFile';
export * from './renameFile';

export const Schemas = {
  [AGENT_TOOLS.command]: CommandSchema,
  [AGENT_TOOLS.editFile]: EditFileSchema,
  [AGENT_TOOLS.readFile]: ReadFileSchema,
  [AGENT_TOOLS.renameFile]: RenameFileSchema,
  [AGENT_TOOLS.createFile]: CreateFileSchema,
  [AGENT_TOOLS.deleteFile]: DeleteFileSchema,
};
