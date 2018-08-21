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
const legacyBroadcast = broadcastFactory.getValidLegacyCampaignBroadcast();

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

test('getBroadcast should return error if broadcast is legacy type', async (t) => {
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(helpers.broadcast, 'fetchById')
    .returns(Promise.resolve(legacyBroadcast));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.broadcast.fetchById.should.have.been.calledWith(broadcastId);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('getBroadcast should call sendErrorResponse if fetchById fails', async (t) => {
  const next = sinon.stub();
  const middleware = getBroadcast();
  const stubError = { message: 'Epic fail' };
  sandbox.stub(helpers.broadcast, 'fetchById')
    .returns(Promise.reject(stubError));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, stubError);
  next.should.not.have.been.called;
});
