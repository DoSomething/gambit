'use strict';

// Load environment vars.
require('dotenv').config();

// @see https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration
require('newrelic');

const cluster = require('./lib/cluster');

if (cluster.clusterRef.isMaster) {
  cluster.initMasterProcess();
} else {
  cluster.initWorkerProcess();
}
