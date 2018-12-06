'use strict';

/* eslint-disable global-require */
// Load environment vars.
require('dotenv').config();

const cluster = require('cluster');

const config = require('./config');
const logger = require('./lib/logger');
/**
 * exitHandler - When any of the workers die the cluster module will emit the 'exit' event.
 *
 * @see https://nodejs.org/docs/latest-v8.x/api/cluster.html#cluster_event_exit_1
 * @param {cluster.Worker} worker
 * @param {Number} code
 * @param {String} signal
 */
function exitHandler(worker, code, signal) {
  logger.info(`Worker ${worker.process.pid} died. Restarting...`, {
    errorCode: code,
    killSignal: signal,
  });
  // Respawn a worker when it dies
  cluster.fork();
}

if (cluster.isMaster) {
  logger.debug('Master process');
  // Fork workers
  for (let workers = 0; workers < config.workers; workers++) { // eslint-disable-line
    cluster.fork();
  }
  // Register exit handler
  cluster.on('exit', exitHandler);
} else {
  // Init worker
  require('./server')();
}
