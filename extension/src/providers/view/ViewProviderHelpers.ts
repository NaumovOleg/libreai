import { Observer } from '@observer';
import { Context } from '@services';
import { Author, ChatMessage, COMMANDS, Conf, CONFIG_PARAGRAPH } from '@utils';
import * as vscode from 'vscode';

import { GraphWorkflow } from '../../graph';
import { ContextSelector } from '../ContextSelector';

export async function selectContextFiles(
  contextSelector: ContextSelector,
  webview: vscode.WebviewView,
) {
  const payload = await contextSelector.openContextSelector();
  webview.webview.postMessage({ type: COMMANDS.selectContext, payload });
}

export function onStartMessages(webview: vscode.WebviewView) {
  return webview.webview.postMessage({
    type: COMMANDS.changeConfig,
    payload: {
      [CONFIG_PARAGRAPH.chatConfig]: Conf.chatConfig,
      [CONFIG_PARAGRAPH.autoCompleteConfig]: Conf.autoCompleteConfig,
      [CONFIG_PARAGRAPH.agentConfig]: Conf.agentConfig,
    },
  });
}

export async function useAgent(message: ChatMessage, ctx: Context, workflow: GraphWorkflow) {
  try {
    const [context, files] = await Promise.all([
      ctx.getContext(message.text, { lookupEmbeddings: false }),
      ctx.getFilesContent(message.files),
    ]);

    return workflow.exec({
      fileTree: context.fileTree,
      language: context.language,
      request: message.text,
      files,
    });
  } catch (err: any) {
    vscode.window.showErrorMessage(err.message);
  }
}

export function interactCommand(payload: any) {
  const observer = Observer.getInstance();
  const event = ('interact-command-' + payload.id) as `interact-command-${string}`;
  observer.emit(event, payload);
}

export function onReceiveUserMessage(
  message: ChatMessage,
  useChat: (message: ChatMessage) => any,
  useAgentFn: (message: ChatMessage) => any,
) {
  if (message.to == Author.chat) {
    return useChat(message);
  }
  if (message.to == Author.agent) {
    return useAgentFn(message);
  }
}
