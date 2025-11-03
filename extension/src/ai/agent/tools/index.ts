/* eslint-disable @typescript-eslint/no-explicit-any */
import { AGENT_TOOLS, ToolCallbacks } from '@utils';
import { FunctionTool } from 'llamaindex';

import { CommandTool } from './command';
import { CreateFileTool } from './createFile';
import { DeleteFileTool } from './deleteFile';
import { EditFileTool } from './editFile';
import { ReadFileTool } from './readFile';
import { RenameFileTool } from './renameFile';
import { SemanticSearch } from './semanticSearch';

export class ToolFactory {
  executorTools: FunctionTool<any, any, any>[];
  plannerTools: FunctionTool<any, any, any>[];
  analizerTools: FunctionTool<any, any, any>[];

  constructor(cbks: Omit<ToolCallbacks, 'planning'>) {
    const command = new CommandTool(cbks[AGENT_TOOLS.command]);
    const create = new CreateFileTool(cbks[AGENT_TOOLS.createFile]);
    const deleteFile = new DeleteFileTool(cbks[AGENT_TOOLS.deleteFile]);
    const edit = new EditFileTool(cbks[AGENT_TOOLS.editFile]);
    const read = new ReadFileTool(cbks[AGENT_TOOLS.readFile]);
    const rename = new RenameFileTool(cbks[AGENT_TOOLS.renameFile]);
    const semanticSearch = new SemanticSearch(cbks[AGENT_TOOLS.semanticSearch]);

    this.executorTools = [
      command.tool,
      create.tool,
      deleteFile.tool,
      edit.tool,
      read.tool,
      rename.tool,
      semanticSearch.tool,
    ];
    this.plannerTools = [semanticSearch.tool];
    this.analizerTools = [semanticSearch.tool, read.tool];
  }
}
