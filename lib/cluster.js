'use strict';

const cluster = require('cluster');
const { RateLimiterClusterMaster, RateLimiterCluster } = require('rate-limiter-flexible');

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

  module.exports.initMasterRateLimiter();

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
  server.start(module.exports.initWorkerRateLimiter());
}

/**
 * initMasterRateLimiter
 * @see https://github.com/animir/node-rate-limiter-flexible/wiki/Cluster#ratelimitercluster
 */
function initMasterRateLimiter() {
  // Doesn't require any options, it is only storage and messages handler
  // It's a singleton
  return new RateLimiterClusterMaster();
}

/**
 * initWorkerRateLimiter
 * @param {String} type
 */
function initWorkerRateLimiter(type = 'default', options = {}) {
  // A little paranoid but super safe :D.
  if (!config.rateLimiter[type]) {
    logger.error(`Rate Limiter type: ${type} is invalid`);
    process.exit(1);
  }
  // Override config options if necessary
  const newOpts = Object.assign({}, config.rateLimiter[type], options);
  return new RateLimiterCluster(newOpts);
}

module.exports = {
  clusterRef: cluster,
  exitHandler,
  forkNewProcess,
  initMasterProcess,
  initWorkerProcess,
  initMasterRateLimiter,
  initWorkerRateLimiter,
};
