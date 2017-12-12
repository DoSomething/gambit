'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../lib/helpers');
const logger = require('../../../../lib/logger');
const stubs = require('../../../helpers/stubs');

const cacheHelper = helpers.cache;
const broadcastId = stubs.getBroadcastId();
const broadcastStats = stubs.getBroadcastStats();

chai.should();
chai.use(sinonChai);

// module to be tested
const getStatsCache = require('../../../../lib/middleware/broadcasts-single/stats-cache-get');

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

test('getStatsCache should send response if cached stats exist', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getStatsCache();
  sandbox.stub(cacheHelper, 'getStatsCacheForBroadcastId')
    .returns(Promise.resolve(broadcastStats));

  // test
  await middleware(t.context.req, t.context.res, next);

  t.context.req.data.stats.should.deep.equal(broadcastStats);
  t.context.res.send.should.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getStatsCache should call next if cached stats not found', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getStatsCache();
  sandbox.stub(cacheHelper, 'getStatsCacheForBroadcastId')
    .returns(Promise.resolve(null));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.not.have.been.called;
  next.should.have.been.called;
});

test('getStatsCache should call next if sendErrorResponse returns null', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getStatsCache();
  sandbox.stub(cacheHelper, 'getStatsCacheForBroadcastId')
    .returns(Promise.reject(new Error()));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});
