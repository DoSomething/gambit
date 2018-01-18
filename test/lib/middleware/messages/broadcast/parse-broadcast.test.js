'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../lib/helpers');
const analyticsHelper = require('../../../../../lib/helpers/analytics');
const contentful = require('../../../../../lib/contentful');
const stubs = require('../../../../helpers/stubs');
const broadcastFactory = require('../../../../helpers/factories/broadcast');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const parseBroadcast = require('../../../../../lib/middleware/messages/broadcast/parse-broadcast');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Setup!
test.beforeEach((t) => {
  sandbox.stub(analyticsHelper, 'addParameters')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);

  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.req.broadcast = broadcastFactory.getValidBroadcast();
  t.context.res = httpMocks.createResponse();
});

// Cleanup!
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('parseBroadcast should inject vars into the req object when they exist', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = parseBroadcast();
  sandbox.spy(contentful, 'getCampaignIdFromBroadcast');
  sandbox.spy(contentful, 'getMessageTextFromBroadcast');
  sandbox.spy(contentful, 'getTopicFromBroadcast');

  // test
  await middleware(t.context.req, t.context.res, next);
  analyticsHelper.addParameters.should.have.been.called;
  contentful.getCampaignIdFromBroadcast.should.have.been.called;
  t.context.req.campaignId.should.equal(stubs.getCampaignId());
  contentful.getTopicFromBroadcast.should.have.been.called;
  t.context.req.topic.should.equal(stubs.getTopic());
  contentful.getMessageTextFromBroadcast.should.have.been.called;
  t.context.req.outboundMessageText.should.equal(stubs.getBroadcastMessageText());
  next.should.have.been.called;
});

test('parseBroadcast should call sendErrorResponse on error', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = parseBroadcast();
  t.context.req.broadcastId = 'notFound';
  sandbox.stub(contentful, 'getCampaignIdFromBroadcast')
    .callsFake(new Error());

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  t.context.req.should.not.have.property('campaignId');
  next.should.not.have.been.called;
});
