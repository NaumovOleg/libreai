/* eslint-disable @typescript-eslint/no-explicit-any */
import { AiProviders } from '@global/types';
import { type BaseMessage, HumanMessage } from '@langchain/core/messages';
import { ChatDeepSeek } from '@langchain/deepseek';
import { MessagesZodMeta } from '@langchain/langgraph';
import { registry } from '@langchain/langgraph/zod';
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { PlannerQuery } from '@utils';
import { z } from 'zod';

export const file = z.string().describe('Full path to the file');
export const content = z.string().describe('Content for insert to file.');
export const command = z.string().describe('Command to  execute.');
export const newName = z.string().describe('New name of file');

export const CtxSchema = z.object({
  language: z.string().optional(),
  fileTree: z.array(z.string()),
  request: z.string(),
  files: z
    .array(
      z.object({
        file: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
});

export const MessagesState = z.object({
  analizerMessages: z.array(z.custom<BaseMessage>()).register(registry, MessagesZodMeta as any),
  plannerMessages: z.array(z.custom<BaseMessage>()).register(registry, MessagesZodMeta as any),
  editorMessages: z.array(z.custom<BaseMessage>()).register(registry, MessagesZodMeta as any),
  ctx: CtxSchema,
});

export const LLM_CONSTRUCTORS = {
  [AiProviders.openai]: ChatOpenAI,
  [AiProviders.ollama]: ChatOllama,
  [AiProviders.deepseek]: ChatDeepSeek,
  [AiProviders.openrouter]: ChatOpenAI,
};

export type Model = ChatOpenAI | ChatOllama | ChatDeepSeek | ChatOpenAI;

export const parseHumanMessage = (ctx: PlannerQuery) => {
  let message = `User request: ${ctx.request}`;
  if (ctx.language) {
    message += `  \n- Language: ${ctx.language}`;
  }
  if (ctx.fileTree?.length) {
    message += `  \n- File tree: ${JSON.stringify(ctx.fileTree, null, 1)}`;
  }
  if (ctx.files?.length) {
    message += `  \n- Files content: ${JSON.stringify(ctx.files, null, 1)}`;
  }

  console.log(message);

  return new HumanMessage(message);
};

export const makeEditorMessage = (state: z.infer<typeof MessagesState>) => {
  let message = `User request: ${state.ctx.request}`;
  if (state.ctx.language) {
    message += `  \n- Language: ${state.ctx.language}`;
  }
  if (state.ctx.fileTree?.length) {
    message += `  \n- File tree: ${JSON.stringify(state.ctx.fileTree, null, 1)}`;
  }
  if (state.ctx.files?.length) {
    message += `  \n- Files content: ${JSON.stringify(state.ctx.files, null, 1)}`;
  }

  return new HumanMessage(message);
};
