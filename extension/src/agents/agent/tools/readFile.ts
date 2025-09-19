import { tool } from '@langchain/core/tools';
import * as vscode from 'vscode';

import { AGENT_TOOLS, getFileContentWithLineNumbers, ReadFileToolArgs } from '../../../utils';
import { Schemas } from './schemas';

export const readFile = tool(
  async (args: ReadFileToolArgs) => {
    console.log('Reading file from disk:', args);

    const url = vscode.Uri.file(args.file);
    const content = await getFileContentWithLineNumbers(url);

    const result = {
      taskId: args.taskId,
      file: args.file,
      content,
      status: 'success',
    };
    console.log('Reading file response :', args.file, content);

    return JSON.stringify(result);
  },
  {
    name: AGENT_TOOLS.readFile,
    description: `Read the full content of a file.`,
    schema: Schemas[AGENT_TOOLS.readFile],
  },
);
