import { ChatMessage } from '@utils';

export const getMessageContent = (message: ChatMessage) => {
  //   if (message.instructions?.length) {
  //     let text = '';
  //     message.instructions.forEach((instruction) => {
  //       text += `\`\`\`${instruction?.language}
  // ${instruction.content}
  // \`\`\`

  // ### \n\n`;
  //     });
  //     return text;
  //   }

  return message.text;
};
