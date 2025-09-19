import { tool } from '@langchain/core/tools';

import { AGENT_TOOLS, EditFileToolArgs } from '../../../utils';
import { Schemas } from './schemas';

export const editFileTool = tool(
  async (args: EditFileToolArgs) => {
    console.log('Updating file:', args);

    return JSON.stringify({
      status: 'success',
      taskId: args.taskId,
    });
  },
  {
    name: AGENT_TOOLS.editFile,
    description: `Edit a file at specific lines using one of three modes.
IMPORTANT!!!: Focus on correct calculation of startLine, endLine, insertMode and code snipped.`,
    schema: Schemas[AGENT_TOOLS.editFile],
  },
);
