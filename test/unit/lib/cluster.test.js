'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Module to test
const cluster = require('../../../lib/cluster');

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// Tests
test('masterProcessInit() should fork at least 1 new process', () => {
  cluster.masterProcessInit();
  Object.values(cluster.clusterRef.workers).length.should.be.above(0);
});
