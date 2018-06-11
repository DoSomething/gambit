'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const gambitCampaigns = require('../../../../../../lib/gambit-campaigns');
const stubs = require('../../../../../helpers/stubs');
const campaignFactory = require('../../../../../helpers/factories/campaign');
const conversationFactory = require('../../../../../helpers/factories/conversation');

const requestHelper = helpers.request;
const replies = helpers.replies;
const mockConversation = conversationFactory.getValidConversation();
const mockCampaign = campaignFactory.getValidCampaign();
const mockKeyword = 'winter';

chai.should();
chai.use(sinonChai);

// module to be tested
const getCampaignByKeyword = require('../../../../../../lib/middleware/messages/member/campaign-keyword');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(replies, 'campaignClosed')
    .returns(underscore.noop);
  sandbox.stub(replies, 'continueTopic')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = mockConversation;
  sandbox.stub(helpers.request, 'changeTopicByCampaign')
    .returns(Promise.resolve(true));
  t.context.req.inboundMessageText = stubs.getKeyword();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getCampaignByKeyword should not call gambitCampaigns.getCampaignByKeyword if requestHelper.parseCampaignKeyword is null', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getCampaignByKeyword();
  sandbox.stub(requestHelper, 'parseCampaignKeyword')
    .returns(null);
  sandbox.spy(gambitCampaigns, 'getCampaignByKeyword');

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.have.been.called;
  gambitCampaigns.getCampaignByKeyword.should.not.have.been.called;
  t.falsy(t.context.req.campaign);
  t.falsy(t.context.req.keyword);
});

test('getCampaignByKeyword should call next if gambitCampaigns.getCampaignByKeyword returns null', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getCampaignByKeyword();
  sandbox.stub(requestHelper, 'parseCampaignKeyword')
    .returns(mockKeyword);
  sandbox.stub(gambitCampaigns, 'getCampaignByKeyword')
    .returns(Promise.resolve(null));

  // test
  await middleware(t.context.req, t.context.res, next);
  gambitCampaigns.getCampaignByKeyword.should.have.been.called;
  helpers.request.changeTopicByCampaign.should.not.have.been.called;
  next.should.have.been.called;
  t.falsy(t.context.req.campaign);
  t.falsy(t.context.req.keyword);
});

test('getCampaignByKeyword should call replies.continueTopic if campaign found', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getCampaignByKeyword();
  sandbox.stub(requestHelper, 'parseCampaignKeyword')
    .returns(mockKeyword);
  sandbox.stub(gambitCampaigns, 'getCampaignByKeyword')
    .returns(Promise.resolve(mockCampaign));


  // test
  await middleware(t.context.req, t.context.res, next);
  gambitCampaigns.getCampaignByKeyword.should.have.been.called;
  helpers.request.changeTopicByCampaign.should.have.been.called;
  t.context.req.keyword.should.equal(mockKeyword);
  replies.continueTopic.should.have.been.called;
});

test('getCampaignByKeyword should call helpers.sendErrorResponse if getCampaignByKeyword fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getCampaignByKeyword();
  sandbox.stub(gambitCampaigns, 'getCampaignByKeyword')
    .returns(Promise.reject(new Error()));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.changeTopicByCampaign.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

// TODO: This test fails with unhandled rejection, not catching req.conversation.changeTopic.
/*
test('getCampaignByKeyword calls helpers.sendErrorResponse if changeTopic fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getCampaignByKeyword();

  const conversation = conversationFactory.getValidConversation();
  t.context.req.conversation = conversation;
  sandbox.stub(gambitCampaigns, 'getCampaignByKeyword')
    .returns(Promise.resolve(true));
  sandbox.stub(conversation, 'changeTopic')
    .returns(Promise.reject(new Error()));

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});
*/
