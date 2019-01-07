'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

const worker = require('../../../lib/server');
const config = require('../../../config');

// Module to test
const cluster = require('../../../lib/cluster');

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// Tests

// initMasterProcess
test('initMasterProcess() should fork at least 1 new process', () => {
  cluster.initMasterProcess();
  Object.values(cluster.clusterRef.workers).length.should.be.equal(config.processes.total);
});

// initWorkerProcess
test('initWorkerProcess() should call the worker.start() function', () => {
  sandbox.spy(worker, 'start');
  cluster.initWorkerProcess();
  worker.start.should.have.been.called;
});

// exitHandler
test('exitHandler() should fork a new process when a worker dies', () => {
  sandbox.spy(cluster, 'exitHandler');
  cluster.initMasterProcess();
  const clusterWorker = cluster.clusterRef.workers['1'];
  // Spying after calling initMasterProcess so we only spy after we kill the worker process
  sandbox.spy(cluster, 'forkNewProcess');

  // exit worker
  clusterWorker.kill();

  /**
   * TODO: I feel like there should be a prettier way to wait for the event before asserting?
   */
  setTimeout(() => {
    cluster.exitHandler.should.have.been.called;
    cluster.forkNewProcess.should.have.been.called;
  }, 1000);
});
