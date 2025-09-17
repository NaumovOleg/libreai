import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';

import { AdvancedCustomLLM } from './llm';
import { echoTool, magicTool } from './tools';

// Instantiate your custom LLM
const customLLM = new AdvancedCustomLLM({ n: 20 });

// Define the prompt for the agent
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant that can use tools.'],
  new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
  new MessagesPlaceholder('agent_scratchpad'),
]);

// Create the tool-calling agent
const agent = createToolCallingAgent({
  llm: customLLM,
  tools: [magicTool, echoTool],
  prompt,
});

// Create an AgentExecutor to run the agent
const agentExecutor = new AgentExecutor({
  agent,
  tools: [magicTool, echoTool],
  verbose: true, // For debugging
});

const y = async () => {
  const result = await agentExecutor.invoke({
    input: 'Add 5 and 7 using the custom calculator.',
    chat_history: [],
  });

  console.log('++++++++Dddddddddd', result.output);
};
y();
