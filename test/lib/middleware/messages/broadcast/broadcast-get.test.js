'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');
const logger = require('heroku-logger');

const helpers = require('../../../../../lib/helpers');
const cacheHelper = require('../../../../../lib/helpers/cache');
const contentful = require('../../../../../lib/contentful');
const stubs = require('../../../../helpers/stubs');
const broadcastFactory = require('../../../../helpers/factories/broadcast');

// stubs
const broadcastId = stubs.getBroadcastId();
const cache = cacheHelper.broadcasts;
const sendErrorResponseStub = underscore.noop;
const mockBroadcast = broadcastFactory.getValidCampaignBroadcast();
const broadcastLookupStub = () => Promise.resolve(mockBroadcast);
const broadcastLookupFailStub = () => Promise.reject({ message: 'Epic fail' });
const broadcastLookupNotFoundStub = () => Promise.reject({ status: 404 });

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getBroadcast = require('../../../../../lib/middleware/messages/broadcast/broadcast-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(sendErrorResponseStub);
  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.req.broadcastId = broadcastId;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

/**
 * Tests
 */
test('getBroadcast should set broadcast from cache if cached', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(cache, 'get')
    .returns(Promise.resolve(mockBroadcast));
  sandbox.stub(contentful, 'fetchBroadcast')
    .callsFake(broadcastLookupStub);
  sandbox.stub(cache, 'set')
    .returns(Promise.resolve(mockBroadcast));

  // test
  await middleware(t.context.req, t.context.res, next);
  cache.get.should.have.been.called;
  contentful.fetchBroadcast.should.not.have.been.called;
  cache.set.should.not.have.been.called;
  t.context.req.broadcast.should.deep.equal(mockBroadcast);
  next.should.have.been.called;
});

test('getBroadcast should fetch from Contentful to set broadcast if not cached', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(cache, 'get')
    .returns(Promise.resolve(null));
  sandbox.stub(contentful, 'fetchBroadcast')
    .callsFake(broadcastLookupStub);
  sandbox.stub(cache, 'set')
    .returns(Promise.resolve(mockBroadcast));

  // test
  await middleware(t.context.req, t.context.res, next);
  cache.get.should.have.been.called;
  contentful.fetchBroadcast.should.have.been.called;
  cache.set.should.have.been.called;
  t.context.req.broadcast.should.deep.equal(mockBroadcast);
  next.should.have.been.called;
});

test('getBroadcast should call sendErrorResponse if broadcastId not found', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(contentful, 'fetchBroadcast')
    .callsFake(broadcastLookupNotFoundStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  t.context.req.should.not.have.property('broadcast');
  next.should.not.have.been.called;
});

test('getBroadcast should call sendErrorResponse if cache.get fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(cache, 'get')
    .returns(Promise.reject(new Error()));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  t.context.req.should.not.have.property('broadcast');
  next.should.not.have.been.called;
});

test('getBroadcast should call sendErrorResponse if contentful.fetchBroadcast fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  t.context.req.broadcastId = 'fail';
  sandbox.stub(contentful, 'fetchBroadcast')
    .callsFake(broadcastLookupFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  t.context.req.should.not.have.property('broadcast');
  next.should.not.have.been.called;
});

test('getBroadcast should call sendErrorResponse if cache.set fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(cache, 'get')
    .returns(Promise.resolve(null));
  sandbox.stub(contentful, 'fetchBroadcast')
    .callsFake(broadcastLookupStub);
  sandbox.stub(cache, 'set')
    .returns(Promise.reject(new Error()));

  // test
  await middleware(t.context.req, t.context.res, next);
  cache.get.should.have.been.called;
  contentful.fetchBroadcast.should.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;

  t.context.req.should.not.have.property('broadcast');
  next.should.not.have.been.called;
});
