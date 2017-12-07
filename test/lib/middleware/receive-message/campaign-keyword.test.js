'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../lib/helpers');
const gambitCampaigns = require('../../../../lib/gambit-campaigns');
const stubs = require('../../../helpers/stubs');
const conversationFactory = require('../../../helpers/factories/conversation');

const requestHelper = helpers.request;
const replies = helpers.replies;
const mockConversation = conversationFactory.getValidConversation();
const mockCampaign = { id: stubs.getCampaignId() };
const mockKeyword = 'winter';

chai.should();
chai.use(sinonChai);

// module to be tested
const getCampaignByKeyword = require('../../../../lib/middleware/receive-message/campaign-keyword');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(replies, 'campaignClosed')
    .returns(underscore.noop);
  sandbox.stub(replies, 'continueCampaign')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = mockConversation;
  sandbox.stub(mockConversation, 'setCampaign')
    .returns(Promise.resolve(true));
  t.context.req.inboundMessageText = 'winter';
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
  t.context.req.conversation.setCampaign.should.not.have.been.called;
  next.should.have.been.called;
  t.falsy(t.context.req.campaign);
  t.falsy(t.context.req.keyword);
});

test('getCampaignByKeyword should call replies.campaignClosed if keyword Campaign is closed', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getCampaignByKeyword();

  sandbox.stub(requestHelper, 'parseCampaignKeyword')
    .returns(mockKeyword);
  sandbox.stub(gambitCampaigns, 'getCampaignByKeyword')
    .returns(Promise.resolve(mockCampaign));
  sandbox.stub(gambitCampaigns, 'isClosedCampaign')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);
  gambitCampaigns.getCampaignByKeyword.should.have.been.called;
  t.context.req.conversation.setCampaign.should.have.been.called;
  gambitCampaigns.isClosedCampaign.should.have.been.called;
  t.context.req.campaign.should.equal(mockCampaign);
  t.context.req.keyword.should.equal(mockKeyword);
  replies.continueCampaign.should.not.have.been.called;
  replies.campaignClosed.should.have.been.called;
});

test('getCampaignByKeyword should call replies.continueCampaign if keyword Campaign is active', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getCampaignByKeyword();

  sandbox.stub(requestHelper, 'parseCampaignKeyword')
    .returns(mockKeyword);
  sandbox.stub(gambitCampaigns, 'getCampaignByKeyword')
    .returns(Promise.resolve(mockCampaign));
  sandbox.stub(gambitCampaigns, 'isClosedCampaign')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);
  gambitCampaigns.getCampaignByKeyword.should.have.been.called;
  t.context.req.conversation.setCampaign.should.have.been.called;
  gambitCampaigns.isClosedCampaign.should.have.been.called;
  t.context.req.campaign.should.equal(mockCampaign);
  t.context.req.keyword.should.equal(mockKeyword);
  replies.continueCampaign.should.have.been.called;
  replies.campaignClosed.should.not.have.been.called;
});
