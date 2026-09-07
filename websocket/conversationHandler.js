import { aiResponse } from '../services/claudeService.js';

const sessions = new Map();

export function registerConversationHandler(fastify) {
  fastify.register(async function (fastify) {
    fastify.get("/ws", { websocket: true }, (ws, req) => {
      ws.on("message", async (data) => {
        const message = JSON.parse(data);
        switch (message.type) {
          case "setup":
            const callSid = message.callSid;
            console.log("Setup for call:", callSid);
            ws.callSid = callSid;
            sessions.set(callSid, []);
            break;

          case "prompt":
            console.log("Processing prompt:", message.voicePrompt);
            try {
              const conversation = sessions.get(ws.callSid);
              conversation.push({ role: "user", content: message.voicePrompt });
              const { responseText, updatedMessages } = await aiResponse(conversation);
              sessions.set(ws.callSid, updatedMessages);
              ws.send(JSON.stringify({ type: "text", token: responseText, last: true }));
              console.log("Sent response:", responseText);
            } catch (err) {
              console.error("Error generating AI response:", err);
              ws.send(JSON.stringify({ type: "text", token: "Sorry, I ran into an error processing that. Could you try again?", last: true }));
            }
            break;

          case "interrupt":
            console.log("Handling interruption.");
            break;

          default:
            console.warn("Unknown message type received:", message.type);
            break;
        }
      });

      ws.on("close", () => {
        console.log("WebSocket connection closed");
        sessions.delete(ws.callSid);
      });
    });
  });
}