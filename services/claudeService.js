import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY, SYSTEM_PROMPT } from '../config.js';
import { TOOLS } from '../tools/schemas.js';
import { executeTool } from '../tools/executor.js';

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

export async function aiResponse(messages) {
  let workingMessages = [...messages];

  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: workingMessages,
    tools: TOOLS,
  });

  while (response.stop_reason === "tool_use") {
    const toolUseBlock = response.content.find((block) => block.type === "tool_use");
    const toolResult = await executeTool(toolUseBlock.name, toolUseBlock.input);

    workingMessages.push({ role: "assistant", content: response.content });
    workingMessages.push({
      role: "user",
      content: [{ type: "tool_result", tool_use_id: toolUseBlock.id, content: toolResult }],
    });

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: workingMessages,
      tools: TOOLS,
    });
  }

  workingMessages.push({ role: "assistant", content: response.content });

  const textBlock = response.content.find((block) => block.type === "text");
  return {
    responseText: textBlock ? textBlock.text : "I'm sorry, I couldn't process that.",
    updatedMessages: workingMessages,
  };
}