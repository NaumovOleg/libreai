import { ChatMessage } from '@utils';

export const getMessageContent = (message: ChatMessage) => {
  if (message.instruction?.content) {
    return `
\`\`\`${message.instruction?.language}
${message.instruction.content}
\`\`\`

###`;
  }
  return message.text;
};
