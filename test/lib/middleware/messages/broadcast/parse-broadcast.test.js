'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../lib/helpers');
const stubs = require('../../../../helpers/stubs');
const broadcastFactory = require('../../../../helpers/factories/broadcast');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const parseBroadcast = require('../../../../../lib/middleware/messages/broadcast/parse-broadcast');

// sinon sandbox object
const sandbox = sinon.sandbox.create();


test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});


test('parseBroadcast should inject vars into the req object for Campaign Broadcasts', async (t) => {
  const next = sinon.stub();
  const middleware = parseBroadcast();
  sandbox.spy(helpers.broadcast, 'parseBroadcast');
  sandbox.spy(helpers.request, 'setCampaignId');
  const broadcast = broadcastFactory.getValidCampaignBroadcast();
  t.context.req.broadcast = broadcast;

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.broadcast.parseBroadcast.should.have.been.calledWith(t.context.req.broadcast);
  helpers.request.setCampaignId.should.have.been.calledWith(t.context.req, stubs.getCampaignId());
  t.context.req.should.not.have.property('topic');
  t.context.req.outboundMessageText.should.equal(stubs.getBroadcastMessageText());
  next.should.have.been.called;
});

test('parseBroadcast should inject vars into the req object for Topic Broadcasts', async (t) => {
  const next = sinon.stub();
  const middleware = parseBroadcast();
  sandbox.spy(helpers.broadcast, 'parseBroadcast');
  t.context.req.broadcast = broadcastFactory.getValidTopicBroadcast();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.broadcast.parseBroadcast.should.have.been.called;
  t.context.req.topic.should.equal(stubs.getTopic());
  t.context.req.should.not.have.property('campaignId');
  t.context.req.outboundMessageText.should.equal(stubs.getBroadcastMessageText());
  next.should.have.been.called;
});

test('parseBroadcast should call sendErrorResponse on error', async (t) => {
  const next = sinon.stub();
  const middleware = parseBroadcast();
  t.context.req.broadcastId = 'notFound';
  sandbox.stub(helpers.broadcast, 'parseBroadcast')
    .throws();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('parseBroadcast should call sendErrorResponse if campaignId and topic undefined', async (t) => {
  const next = sinon.stub();
  const middleware = parseBroadcast();
  t.context.req.broadcast = broadcastFactory.getInvalidBroadcast();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});
