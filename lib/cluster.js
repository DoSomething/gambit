'use strict';

const cluster = require('cluster');

const config = require('../config');
const logger = require('./logger');
const server = require('./server');
/**
 * forkNewProcess
 * @returns {cluster.Worker}
 */
function forkNewProcess() {
  return cluster.fork();
}
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
  module.exports.forkNewProcess();
}
/**
 * initMasterProcess - It inits the master process, forks child processes, and registers handlers
 */
function initMasterProcess() {
  logger.debug('Master process');
  // Fork workers
  for (let workers = 0; workers < config.processes.total; workers++) { // eslint-disable-line
    module.exports.forkNewProcess();
  }
  // Register exit handler
  cluster.on('exit', module.exports.exitHandler);
}
/**
 * initWorkerProcess - It inits the worker process
 */
function initWorkerProcess() {
  server.start();
}

module.exports = {
  clusterRef: cluster,
  exitHandler,
  forkNewProcess,
  initMasterProcess,
  initWorkerProcess,
};
