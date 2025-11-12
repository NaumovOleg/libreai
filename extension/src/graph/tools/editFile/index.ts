import { tool } from '@langchain/core/tools';
import { Observer } from '@observer';
import { AgentMessagePayload, EditFileToolArgs } from '@utils';

import { meta, schema } from './meta';
import { processor } from './processor';

export const edit = tool<typeof schema, EditFileToolArgs>(async (args, { toolCall }) => {
  console.log('TOOL----------->', meta.name, args);
  try {
    const observer = Observer.getInstance();

    const event: AgentMessagePayload<'editFile'> = {
      status: 'pending',
      id: toolCall.id,
      error: undefined,
      args: { file: args.file, content: args.content },
      type: 'editFile',
    };
    observer.emit('agent', event);
    event.status = 'done';

    const editResponse = await processor(args).catch((err) => {
      event.status = 'error';
      event.error = err.message;
    });

    event.args.old = editResponse?.old;
    event.args.content = editResponse?.content ?? args.content;

    observer.emit('agent', event);
    return 'edited';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return `${err.name}. ${err.message}`;
  }
}, meta);
