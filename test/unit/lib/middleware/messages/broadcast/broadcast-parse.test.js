'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const broadcastFactory = require('../../../../../helpers/factories/broadcast');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const parseBroadcast = require('../../../../../../lib/middleware/messages/broadcast/broadcast-parse');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.attachments, 'add')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setCampaignId')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setOutboundMessageTemplate')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setOutboundMessageText')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setTopic')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('parseBroadcast should parse broadcast and inject vars into req', async (t) => {
  const next = sinon.stub();
  const middleware = parseBroadcast();
  sandbox.spy(helpers.broadcast, 'parseBroadcast');
  const broadcast = broadcastFactory.getValidCampaignBroadcast();
  t.context.req.broadcast = broadcast;

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.broadcast.parseBroadcast.should.have.been.calledWith(t.context.req.broadcast);
  helpers.request.setCampaignId.should.have.been.called;
  helpers.request.setTopic.should.not.have.been.called;
  helpers.request.setOutboundMessageText.should.have.been.called;
  helpers.request.setOutboundMessageTemplate.should.have.been.called;
  helpers.attachments.add.should.have.been.called;
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
