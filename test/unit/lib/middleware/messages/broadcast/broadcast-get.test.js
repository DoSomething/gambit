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

const helpers = require('../../../../../../lib/helpers');
const stubs = require('../../../../../helpers/stubs');
const broadcastFactory = require('../../../../../helpers/factories/broadcast');

// stubs
const broadcastId = stubs.getBroadcastId();
const mockBroadcast = broadcastFactory.getValidCampaignBroadcast();

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getBroadcast = require('../../../../../../lib/middleware/messages/broadcast/broadcast-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
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
test('getBroadcast should inject broadcast property from fetchBroadcastById result', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(helpers.broadcast, 'fetchBroadcastById')
    .returns(Promise.resolve(mockBroadcast));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.broadcast.fetchBroadcastById.should.have.been.calledWith(broadcastId);
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getBroadcast should call sendErrorResponse if fetchBroadcastById fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(helpers.broadcast, 'fetchBroadcastById')
    .returns(Promise.reject(new Error()));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  t.context.req.should.not.have.property('broadcast');
  next.should.not.have.been.called;
});
