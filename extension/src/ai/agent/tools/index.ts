import { DynamicStructuredTool } from '@langchain/core/tools';

import { AGENT_TOOLS, ToolCallbacks } from '../../../utils';
import { CommandTool } from './command';
import { CreateFileTool } from './createFile';
import { DeleteFileTool } from './deleteFile';
import { EditFileTool } from './editFile';
import { ReadFileTool } from './readFile';
import { RenameFileTool } from './renameFile';
export class ToolFactory {
  tools: DynamicStructuredTool[];

  constructor(cbks: ToolCallbacks) {
    const command = new CommandTool(cbks[AGENT_TOOLS.command]);
    const create = new CreateFileTool(cbks[AGENT_TOOLS.createFile]);
    const deleteFile = new DeleteFileTool(cbks[AGENT_TOOLS.deleteFile]);
    const edit = new EditFileTool(cbks[AGENT_TOOLS.editFile]);
    const read = new ReadFileTool(cbks[AGENT_TOOLS.readFile]);
    const rename = new RenameFileTool(cbks[AGENT_TOOLS.renameFile]);

    this.tools = [command.tool, create.tool, deleteFile.tool, edit.tool, read.tool, rename.tool];
  }
}
