'use strict';

// Load environment vars.
require('dotenv').config();

const cluster = require('./lib/cluster');

if (cluster.clusterRef.isMaster) {
  cluster.initMasterProcess();
} else {
  cluster.initWorkerProcess();
}
