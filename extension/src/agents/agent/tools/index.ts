import { DynamicStructuredTool } from '@langchain/core/tools';

import { EditorObserver } from '../../../observer';
import { AGENT_TOOLS, ToolCallbacks } from '../../../utils';
import { CommandTool } from './command';
import { CreateFileTool } from './createFile';
import { DeleteFileTool } from './deleteFile';
import { EditFileTool } from './editFile';
import { ReadFileTool } from './readFile';
import { RenameFileTool } from './renameFile';
export class ToolFactory {
  tools: DynamicStructuredTool[];

  constructor(cbks: ToolCallbacks, observer: EditorObserver) {
    const command = new CommandTool(cbks[AGENT_TOOLS.command], observer);
    const create = new CreateFileTool(cbks[AGENT_TOOLS.createFile], observer);
    const deleteFile = new DeleteFileTool(cbks[AGENT_TOOLS.deleteFile], observer);
    const edit = new EditFileTool(cbks[AGENT_TOOLS.editFile], observer);
    const read = new ReadFileTool(cbks[AGENT_TOOLS.readFile], observer);
    const rename = new RenameFileTool(cbks[AGENT_TOOLS.renameFile], observer);

    this.tools = [command.tool, create.tool, deleteFile.tool, edit.tool, read.tool, rename.tool];
  }
}
