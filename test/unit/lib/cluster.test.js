'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

const worker = require('../../../server');
const config = require('../../../config');

// Module to test
const cluster = require('../../../lib/cluster');

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// Tests

// masterProcessInit
test('masterProcessInit() should fork at least 1 new process', () => {
  cluster.masterProcessInit();
  Object.values(cluster.clusterRef.workers).length.should.be.equal(config.processes.total);
});

// workerProcessInit
test('workerProcessInit() should call the server module', () => {
  sandbox.spy(worker, 'workerProcessMain');
  cluster.workerProcessInit();
  worker.workerProcessMain.should.have.been.called;
});
