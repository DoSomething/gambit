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
const broadcastFactory = require('../../../../../helpers/factories/broadcast');

const broadcasts = [
  broadcastFactory.getValidLegacyCampaignBroadcast(),
  broadcastFactory.getValidLegacyRivescriptTopicBroadcast(),
];

chai.should();
chai.use(sinonChai);

// module to be tested
const getBroadcasts = require('../../../../../../lib/middleware/broadcasts/index');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.query = { skip: 11 };
  t.context.res = httpMocks.createResponse();
  sandbox.spy(t.context.res, 'send');
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getBroadcasts should return helpers.broadcast.fetch result upon success', async (t) => {
  const middleware = getBroadcasts();
  sandbox.stub(helpers.broadcast, 'fetch')
    .returns(Promise.resolve(broadcasts));

  // test
  await middleware(t.context.req, t.context.res);

  helpers.broadcast.fetch.should.have.been.calledWith(t.context.req.query);
  t.context.res.send.should.have.been.calledWith(broadcasts);
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getBroadcasts should return helpers.broadcast.fetch error upon fail', async (t) => {
  const error = new Error({ message: 'Epic fail' });
  const middleware = getBroadcasts();
  sandbox.stub(helpers.broadcast, 'fetch')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res);

  helpers.broadcast.fetch.should.have.been.calledWith(t.context.req.query);
  t.context.res.send.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
