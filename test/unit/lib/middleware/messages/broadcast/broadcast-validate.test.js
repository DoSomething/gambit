'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const campaigns = require('../../../../../../lib/gambit-campaigns');
const helpers = require('../../../../../../lib/helpers');
const stubs = require('../../../../../helpers/stubs');
const campaignFactory = require('../../../../../helpers/factories/campaign');
const conversationFactory = require('../../../../../helpers/factories/conversation');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const validateBroadcast = require('../../../../../../lib/middleware/messages/broadcast/broadcast-validate');

const campaign = campaignFactory.getValidCampaign();
const conversation = conversationFactory.getValidConversation();
const conversationSaveStub = Promise.resolve(conversation);

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = conversation;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('validateBroadcast should call sendErrorResponse if req.topic and req.campaignId undefined', async (t) => {
  const next = sinon.stub();
  const middleware = validateBroadcast();
  sandbox.stub(conversation, 'setTopic')
    .returns(conversationSaveStub);
  sandbox.stub(conversation, 'promptSignupForCampaign')
    .returns(conversationSaveStub);

  // test
  await middleware(t.context.req, t.context.res, next);

  t.context.req.conversation.setTopic.should.not.have.been.called;
  t.context.req.conversation.promptSignupForCampaign.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('validateBroadcast should call conversation.setTopic if req.topic is set', async (t) => {
  const next = sinon.stub();
  const middleware = validateBroadcast();
  const topic = stubs.getTopic();
  t.context.req.topic = topic;
  sandbox.stub(conversation, 'setTopic')
    .returns(conversationSaveStub);
  sandbox.stub(conversation, 'promptSignupForCampaign')
    .returns(conversationSaveStub);

  // test
  await middleware(t.context.req, t.context.res, next);

  t.context.req.conversation.setTopic.should.have.been.called;
  next.should.have.been.called;
  t.context.req.conversation.promptSignupForCampaign.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('validateBroadcast should call getCampaignId if req.topic undefined and req.campaignId exists', async (t) => {
  const next = sinon.stub();
  const middleware = validateBroadcast();
  t.context.req.campaignId = stubs.getCampaignId();
  sandbox.stub(conversation, 'setTopic')
    .returns(conversationSaveStub);
  sandbox.stub(conversation, 'promptSignupForCampaign')
    .returns(conversationSaveStub);
  sandbox.stub(campaigns, 'getCampaignById')
    .returns(Promise.resolve(campaign));

  // test
  await middleware(t.context.req, t.context.res, next);

  t.context.req.conversation.setTopic.should.not.have.been.called;
  next.should.have.been.called;
  campaigns.getCampaignById.should.have.been.called;
  t.context.req.conversation.promptSignupForCampaign.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('validateBroadcast should call sendErrorResponse if getCampaignById throws', async (t) => {
  const next = sinon.stub();
  const middleware = validateBroadcast();
  t.context.req.campaignId = stubs.getCampaignId();
  sandbox.stub(conversation, 'setTopic')
    .returns(conversationSaveStub);
  sandbox.stub(conversation, 'promptSignupForCampaign')
    .returns(conversationSaveStub);
  sandbox.stub(campaigns, 'getCampaignById')
    .returns(Promise.reject('epic fail'));

  // test
  await middleware(t.context.req, t.context.res, next);

  campaigns.getCampaignById.should.have.been.called;
  t.context.req.conversation.promptSignupForCampaign.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('validateBroadcast should call sendErrorResponse if promptSignupForCampaign throws', async (t) => {
  const next = sinon.stub();
  const middleware = validateBroadcast();
  t.context.req.campaignId = stubs.getCampaignId();
  sandbox.stub(conversation, 'setTopic')
    .returns(conversationSaveStub);
  sandbox.stub(conversation, 'promptSignupForCampaign')
    .throws();
  sandbox.stub(campaigns, 'getCampaignById')
    .returns(Promise.resolve(campaign));

  // test
  await middleware(t.context.req, t.context.res, next);

  campaigns.getCampaignById.should.have.been.called;
  t.context.req.conversation.promptSignupForCampaign.should.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});
