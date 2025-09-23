import { DynamicStructuredTool, tool } from '@langchain/core/tools';

import { EditorObserver } from '../../../observer';
import { PreviewManager } from '../../../services';
import { AGENT_TOOLS, EditFileToolArgs, EDITOR_EVENTS, ToolCallbacks, uuid } from '../../../utils';
import { Schemas } from './schemas';

export class EditFileTool {
  tool: DynamicStructuredTool;

  constructor(cb: ToolCallbacks[AGENT_TOOLS.editFile]) {
    this.tool = tool(
      async (args: EditFileToolArgs) => {
        const observer = EditorObserver.getInstance();
        const event = { id: uuid(4), args: { file: args.file, content: args.content } };
        console.log('Updating file:', args, cb);
        observer.emit(EDITOR_EVENTS.editFile, { status: 'pending', ...event });
        let status = 'success';
        try {
          const preview = await PreviewManager.createPreview(args.file, args.content);

          if (preview === 'accept') {
            console.log('User accepted changes');
          } else {
            console.log('User rejected changes');
          }
        } catch (err) {
          console.log(err);
        }

        await cb(args).catch(() => (status = 'error'));
        observer.emit(EDITOR_EVENTS.editFile, { status: 'done', ...event });
        return JSON.stringify({
          status,
          taskId: args.taskId,
          tool: AGENT_TOOLS.editFile,
        });
      },
      {
        name: AGENT_TOOLS.editFile,
        description: `Edit a file at specific lines using one of three modes.
IMPORTANT!!!: Focus on correct calculation of startLine, endLine, insertMode and code snipped.`,
        schema: Schemas[AGENT_TOOLS.editFile],
      },
    );
  }
}
