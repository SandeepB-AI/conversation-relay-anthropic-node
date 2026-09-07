import Fastify from 'fastify';
import fastifyFormBody from '@fastify/formbody';
import fastifyWs from '@fastify/websocket';
import { PORT, DOMAIN } from './config.js';
import { registerTwimlRoute } from './routes/twimlRoute.js';
import { registerConversationHandler } from './websocket/conversationHandler.js';

const fastify = Fastify({ logger: true });
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

registerTwimlRoute(fastify);
registerConversationHandler(fastify);

try {
  //fastify.listen({ port: PORT });
  fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Server running at http://localhost:${PORT} and wss://${DOMAIN}/ws`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}