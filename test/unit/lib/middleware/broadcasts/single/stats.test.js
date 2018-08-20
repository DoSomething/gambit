'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const logger = require('../../../../../../lib/logger');
const stubs = require('../../../../../helpers/stubs');

const broadcastId = stubs.getBroadcastId();
const broadcastStats = stubs.getBroadcastStats();

chai.should();
chai.use(sinonChai);

// module to be tested
const getStats = require('../../../../../../lib/middleware/broadcasts/single/stats');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.broadcastId = broadcastId;
  t.context.req.data = {};
  t.context.res = httpMocks.createResponse();
  sandbox.spy(t.context.res, 'send');
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getStats should call aggregateMessagesForBroadcastId, formatStats and send data', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getStats();
  const mockResult = { id: '123' };
  sandbox.stub(helpers.broadcast, 'aggregateMessagesForBroadcastId')
    .returns(Promise.resolve(mockResult));
  sandbox.stub(helpers.broadcast, 'formatStats')
    .returns(broadcastStats);

  // test
  await middleware(t.context.req, t.context.res, next);

  t.context.req.data.stats.should.deep.equal(broadcastStats);
  t.context.res.send.should.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getStats should sendErrorResponse if aggregateMessagesForBroadcastId fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getStats();
  sandbox.stub(helpers.broadcast, 'aggregateMessagesForBroadcastId')
    .returns(Promise.reject(new Error()));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.called;
});
