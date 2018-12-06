'use strict';

const redis = require('redis');
const logger = require('../lib/logger');

let redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Running in wercker
if (process.env.REDIS_PORT_6379_TCP_ADDR) {
  redisUrl = `redis://${process.env.REDIS_PORT_6379_TCP_ADDR}:${process.env.REDIS_PORT_6379_TCP_PORT}`;
}

let redisClient;

module.exports = function getRedisClient() {
  if (!redisClient) {
    redisClient = redis.createClient(redisUrl);
    redisClient.on('error', (error) => {
      logger.error(`redisClient connection error: ${error}`);
      redisClient.quit();
      throw error;
    });
    redisClient.on('reconnecting', () => {
      logger.debug('redisClient is reconnecting');
    });
    /**
     * Set the connection name every time it reconnects
     * otherwise  the name is lost on reconnection
     */
    redisClient.on('ready', () => {
      // Save the worker pid as the client name to help id connections
      redisClient.client('SETNAME', `clientWorkerPid:${process.pid}`);
    });
  }
  return redisClient;
};
