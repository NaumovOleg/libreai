/* eslint-disable @typescript-eslint/no-explicit-any */
import { AGENT_TOOLS, ToolCallbacks } from '@utils';
import { FunctionTool } from 'llamaindex';

import { CommandTool } from './command';
import { CreateFileTool } from './createFile';
import { DeleteFileTool } from './deleteFile';
import { EditFileTool } from './editFile';
import { ReadFileTool } from './readFile';
import { RenameFileTool } from './renameFile';
import { SearchEmbeddings } from './retrieveEmbeddings';

export class ToolFactory {
  tools: FunctionTool<any, any, any>[];
  plannerTools: FunctionTool<any, any, any>[];
  analizerTools: FunctionTool<any, any, any>[];

  constructor(cbks: Omit<ToolCallbacks, 'planning'>) {
    const command = new CommandTool(cbks[AGENT_TOOLS.command]);
    const create = new CreateFileTool(cbks[AGENT_TOOLS.createFile]);
    const deleteFile = new DeleteFileTool(cbks[AGENT_TOOLS.deleteFile]);
    const edit = new EditFileTool(cbks[AGENT_TOOLS.editFile]);
    const read = new ReadFileTool(cbks[AGENT_TOOLS.readFile]);
    const rename = new RenameFileTool(cbks[AGENT_TOOLS.renameFile]);
    const retrieveEmbeddings = new SearchEmbeddings(cbks[AGENT_TOOLS.retrieveEmbeddings]);

    this.tools = [command.tool, create.tool, deleteFile.tool, edit.tool, read.tool, rename.tool];
    this.plannerTools = [retrieveEmbeddings.tool];
    this.analizerTools = [retrieveEmbeddings.tool, read.tool];
  }
}
