import { WS_URL, WELCOME_GREETING } from '../config.js';

export function registerTwimlRoute(fastify) {
  fastify.all("/twiml", async (request, reply) => {
    reply.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?><Response><Connect><ConversationRelay url="${WS_URL}" welcomeGreeting="${WELCOME_GREETING}" /></Connect></Response>`);
  });
}