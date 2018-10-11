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
const askVotingPlanStatusBroadcast = broadcastFactory.getValidAskVotingPlanStatus();
const askYesNoBroadcast = broadcastFactory.getValidAskYesNo();
const autoReplyBroadcast = broadcastFactory.getValidAutoReplyBroadcast();
const legacyBroadcast = broadcastFactory.getValidLegacyCampaignBroadcast();
const saidYesTemplate = askYesNoBroadcast.templates.saidYes;

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
  t.context.req.broadcast.should.deep.equal(legacyBroadcast);
  helpers.broadcast.fetchById.should.have.been.calledWith(broadcastId);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('getBroadcast should return error if askYesNo topic campaign is closed', async (t) => {
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(helpers.broadcast, 'fetchById')
    .returns(Promise.resolve(askYesNoBroadcast));
  sandbox.stub(helpers.topic, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.broadcast.should.deep.equal(askYesNoBroadcast);
  helpers.broadcast.fetchById.should.have.been.calledWith(broadcastId);
  helpers.topic.hasCampaign.should.have.been.calledWith(saidYesTemplate.topic);
  helpers.campaign.isClosedCampaign.should.have.been.calledWith(saidYesTemplate.topic.campaign);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('getBroadcast should call next if askYesNo topic campaign is not closed', async (t) => {
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(helpers.broadcast, 'fetchById')
    .returns(Promise.resolve(askYesNoBroadcast));
  sandbox.stub(helpers.topic, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.broadcast.should.deep.equal(askYesNoBroadcast);
  helpers.broadcast.fetchById.should.have.been.calledWith(broadcastId);
  helpers.topic.hasCampaign.should.have.been.calledWith(saidYesTemplate.topic);
  helpers.campaign.isClosedCampaign.should.have.been.calledWith(saidYesTemplate.topic.campaign);
  next.should.have.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getBroadcast should call next if broadcast type is askVotingPlanStatus', async (t) => {
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(helpers.broadcast, 'fetchById')
    .returns(Promise.resolve(askVotingPlanStatusBroadcast));
  sandbox.stub(helpers.topic, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.broadcast.should.deep.equal(askVotingPlanStatusBroadcast);
  helpers.broadcast.fetchById.should.have.been.calledWith(broadcastId);
  helpers.topic.hasCampaign.should.not.have.been.called;
  helpers.campaign.isClosedCampaign.should.not.have.been.called;
  next.should.have.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getBroadcast should return error if not askYesNo and broadcast.message.topic does not have id', async (t) => {
  const next = sinon.stub();
  const middleware = getBroadcast();
  const draftBroadcast = broadcastFactory.getValidAutoReplyBroadcast();
  draftBroadcast.message.topic = {};
  sandbox.stub(helpers.broadcast, 'fetchById')
    .returns(Promise.resolve(draftBroadcast));

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.broadcast.should.deep.equal(draftBroadcast);
  helpers.broadcast.fetchById.should.have.been.calledWith(broadcastId);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('getBroadcast should return error if not askYesNo and broadcast.message.topic campaign is closed', async (t) => {
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(helpers.broadcast, 'fetchById')
    .returns(Promise.resolve(autoReplyBroadcast));
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.broadcast.should.deep.equal(autoReplyBroadcast);
  helpers.broadcast.fetchById.should.have.been.calledWith(broadcastId);
  helpers.campaign.isClosedCampaign
    .should.have.been.calledWith(autoReplyBroadcast.message.topic.campaign);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('getBroadcast should return error if not askYesNo and broadcast.message.topic campaign is not closed', async (t) => {
  const next = sinon.stub();
  const middleware = getBroadcast();
  sandbox.stub(helpers.broadcast, 'fetchById')
    .returns(Promise.resolve(autoReplyBroadcast));
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.broadcast.should.deep.equal(autoReplyBroadcast);
  helpers.broadcast.fetchById.should.have.been.calledWith(broadcastId);
  helpers.campaign.isClosedCampaign
    .should.have.been.calledWith(autoReplyBroadcast.message.topic.campaign);
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
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
