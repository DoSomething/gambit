'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const Promise = require('bluebird');

const stubs = require('../../../helpers/stubs');
const logger = require('../../../../lib/logger');
const gambitCampaigns = require('../../../../lib/gambit-campaigns');
const helpers = require('../../../../lib/helpers');
const templatesConfig = require('../../../../config/lib/helpers/template');
const Message = require('../../../../app/models/Message');
const conversationFactory = require('../../../helpers/factories/conversation');
const messageFactory = require('../../../helpers/factories/message');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const repliesHelper = require('../../../../lib/helpers/replies');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// misc helper vars
const gCampResponse = stubs.gambitCampaigns.getReceiveMessageResponse();
const templates = templatesConfig.templatesMap;
const resolvedPromise = Promise.resolve({});
const rejectedPromise = Promise.reject({});

// Setup
test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();

  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(() => {});

  // add a campaign object
  t.context.req.campaign = { id: stubs.getCampaignId() };
});

// Cleanup
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

// Assert helper functions
// TODO: Maybe move to own asserts module?
async function assertSendingReplyWithCampaignTemplate(req, res, template, replyName) {
  sandbox.stub(repliesHelper, 'sendReplyWithCampaignTemplate')
    .returns(resolvedPromise);

  await repliesHelper[replyName || template](req, res);
  repliesHelper.sendReplyWithCampaignTemplate
    .should.have.been.calledWith(req, res, template);
}

async function assertSendingGambitConversationsTemplate(req, res, template, replyName) {
  sandbox.stub(repliesHelper, 'sendGambitConversationsTemplate')
    .returns(resolvedPromise);

  await repliesHelper[replyName || template](req, res);
  repliesHelper.sendGambitConversationsTemplate
    .should.have.been.calledWith(req, res, template);
}

function getReqWithProps(opts = {}) {
  const req = httpMocks.createRequest();
  req.metadata = {};
  req.isARetryRequest = opts.isARetryRequest || function () { return false; };
  req.inboundMessage = opts.inboundMessage;
  req.conversation = opts.conversation || conversationFactory.getValidConversation();
  req.conversation.lastOutboundMessage = opts.lastOutboundMessage;
  req.outboundMessage = opts.outboundMessage;
  return req;
}

/**
 * Tests --------------------------------------------------
 */

test('sendReply(): responds with the inbound and outbound messages', async (t) => {
  // setup
  const inboundMessage = messageFactory.getValidMessage();
  const lastOutboundMessage = messageFactory.getValidOutboundReplyMessage();
  const req = getReqWithProps({
    inboundMessage,
    lastOutboundMessage,
  });
  sandbox.stub(req.conversation, 'createAndSetLastOutboundMessage')
    .returns(resolvedPromise);
  sandbox.stub(req.conversation, 'postLastOutboundMessageToPlatform')
    .returns(resolvedPromise);
  sandbox.spy(t.context.res, 'send');

  // test
  await repliesHelper.sendReply(req, t.context.res, 'text line', templates.campaignClosed);
  const responseMessages = t.context.res.send.getCall(0).args[0].data.messages;

  // asserts
  t.context.res.send.should.have.been.called;
  req.conversation.createAndSetLastOutboundMessage.should.have.been.called;
  req.conversation.postLastOutboundMessageToPlatform.should.have.been.called;
  responseMessages.inbound[0].should.be.equal(inboundMessage);
  responseMessages.outbound[0].should.be.equal(lastOutboundMessage);
});

test('sendReply(): should not call createAndSetLastOutboundMessage if outbound message has been loaded', async (t) => {
  // setup
  const outboundMessage = messageFactory.getValidOutboundReplyMessage();
  const req = getReqWithProps({
    lastOutboundMessage: outboundMessage,
    outboundMessage,
    isARetryRequest: () => true,
  });
  sandbox.stub(req.conversation, 'createAndSetLastOutboundMessage')
    .returns(resolvedPromise);
  sandbox.stub(req.conversation, 'postLastOutboundMessageToPlatform')
    .returns(resolvedPromise);
  sandbox.stub(Message, 'updateMessageByRequestIdAndDirection')
    .returns(resolvedPromise);

  // test
  await repliesHelper.sendReply(req, t.context.res, 'text line', templates.campaignClosed);

  // asserts
  req.conversation.createAndSetLastOutboundMessage.should.not.have.been.called;
  req.conversation.postLastOutboundMessageToPlatform.should.have.been.called;
});

test('sendReply(): should createAndSetLastOutboundMessage outbound message if no outboundMessage was loaded on a retry', async (t) => {
  // setup
  const inboundMessage = messageFactory.getValidMessage();
  const lastOutboundMessage = messageFactory.getValidOutboundReplyMessage();
  const req = getReqWithProps({
    inboundMessage,
    lastOutboundMessage,
    isARetryRequest: () => true,
  });
  sandbox.stub(req.conversation, 'createAndSetLastOutboundMessage')
    .returns(resolvedPromise);
  sandbox.stub(req.conversation, 'postLastOutboundMessageToPlatform')
    .returns(resolvedPromise);

  // test
  await repliesHelper.sendReply(req, t.context.res, 'text line', templates.campaignClosed);

  // asserts
  req.conversation.createAndSetLastOutboundMessage.should.have.been.called;
  req.conversation.postLastOutboundMessageToPlatform.should.have.been.called;
});

test('sendReply(): should call sendErrorResponse on failure', async (t) => {
  // setup
  const req = getReqWithProps();
  sandbox.stub(req.conversation, 'createAndSetLastOutboundMessage')
    .returns(rejectedPromise);

  // test
  await repliesHelper.sendReply(req, t.context.res, 'text line', templates.campaignClosed);

  // asserts
  helpers.sendErrorResponse.should.have.been.called;
});

test('continueCampaign(): sendReplyWithCampaignTemplate should be called', async (t) => {
  sandbox.stub(gambitCampaigns, 'postCampaignActivity')
    .returns(Promise.resolve(gCampResponse.data));
  sandbox.stub(repliesHelper, 'sendReplyWithCampaignTemplate')
    .returns(resolvedPromise);

  await repliesHelper.continueCampaign(t.context.req, t.context.res);
  repliesHelper.sendReplyWithCampaignTemplate.should.have.been.called;
});

test('continueCampaign(): helpers.sendErrorResponse should be called if no campaign exists', async (t) => {
  sandbox.stub(gambitCampaigns, 'postCampaignActivity')
    .returns(Promise.reject(gCampResponse.data));
  sandbox.stub(repliesHelper, 'sendReplyWithCampaignTemplate')
    .returns(resolvedPromise);

  await repliesHelper.continueCampaign(t.context.req, t.context.res);
  repliesHelper.sendReplyWithCampaignTemplate.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('continueCampaign(): helpers.sendErrorResponse should be called on Gambit Campaign error', async (t) => {
  t.context.req.campaign = {};
  sandbox.stub(repliesHelper, 'sendReplyWithCampaignTemplate')
    .returns(resolvedPromise);

  await repliesHelper.continueCampaign(t.context.req, t.context.res);
  repliesHelper.sendReplyWithCampaignTemplate.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('askContinue(): should call sendReplyWithCampaignTemplate', async (t) => {
  const template = templates.askContinueTemplates.askContinue;
  await assertSendingReplyWithCampaignTemplate(t.context.req, t.context.res, template);
});

test('askSignup(): should call sendReplyWithCampaignTemplate', async (t) => {
  const template = templates.askSignupTemplates.askSignup;
  await assertSendingReplyWithCampaignTemplate(t.context.req, t.context.res, template);
});

test('campaignClosed(): should call sendReplyWithCampaignTemplate', async (t) => {
  const template = templates.campaignClosed;
  await assertSendingReplyWithCampaignTemplate(t.context.req, t.context.res, template);
});

test('confirmedContinue(): should call continueCampaign', async (t) => {
  sandbox.stub(repliesHelper, 'continueCampaign')
    .returns(resolvedPromise);

  await repliesHelper.confirmedContinue(t.context.req, t.context.res);
  repliesHelper.continueCampaign.should.have.been.called;
  // TODO: Should not be testing hardcoded strings
  repliesHelper.continueCampaign.getCall(0).args[0].keyword.should.equal('continue');
});

test('confirmedSignup(): should call continueCampaign', async (t) => {
  sandbox.stub(repliesHelper, 'continueCampaign')
    .returns(resolvedPromise);

  await repliesHelper.confirmedSignup(t.context.req, t.context.res);
  repliesHelper.continueCampaign.should.have.been.called;
  // TODO: Should not be testing hardcoded strings
  repliesHelper.continueCampaign.getCall(0).args[0].keyword.should.equal('confirmed');
});

test('declinedContinue(): should call sendReplyWithCampaignTemplate', async (t) => {
  const template = templates.declinedContinue;
  await assertSendingReplyWithCampaignTemplate(t.context.req, t.context.res, template);
});

test('declinedSignup(): should call sendReplyWithCampaignTemplate', async (t) => {
  const template = templates.declinedSignup;
  await assertSendingReplyWithCampaignTemplate(t.context.req, t.context.res, template);
});

test('invalidAskContinueResponse(): should call sendReplyWithCampaignTemplate', async (t) => {
  const template = templates.askContinueTemplates.invalidAskContinueResponse;
  await assertSendingReplyWithCampaignTemplate(t.context.req, t.context.res, template);
});

test('invalidAskSignupResponse(): should call sendReplyWithCampaignTemplate', async (t) => {
  const template = templates.askSignupTemplates.invalidAskSignupResponse;
  await assertSendingReplyWithCampaignTemplate(t.context.req, t.context.res, template);
});

test('badWords(): should call sendGambitConversationsTemplate', async (t) => {
  const template = templates.gambitConversationsTemplates.badWords.name;
  await assertSendingGambitConversationsTemplate(t.context.req, t.context.res, template);
});

test('crisis(): should call sendGambitConversationsTemplate', async (t) => {
  const template = templates.gambitConversationsTemplates.crisis.name;
  await assertSendingGambitConversationsTemplate(t.context.req, t.context.res, template, 'crisisMessage');
});

test('info(): should call sendGambitConversationsTemplate', async (t) => {
  const template = templates.gambitConversationsTemplates.info.name;
  await assertSendingGambitConversationsTemplate(t.context.req, t.context.res, template, 'infoMessage');
});

test('noCampaign(): should call sendGambitConversationsTemplate', async (t) => {
  const template = templates.gambitConversationsTemplates.noCampaign.name;
  await assertSendingGambitConversationsTemplate(t.context.req, t.context.res, template);
});

test('noReply(): should call sendGambitConversationsTemplate', async (t) => {
  const template = templates.gambitConversationsTemplates.noReply.name;
  await assertSendingGambitConversationsTemplate(t.context.req, t.context.res, template);
});

test('subscriptionStatusLess(): should call sendGambitConversationsTemplate', async (t) => {
  const template = templates.gambitConversationsTemplates.subscriptionStatusLess.name;
  await assertSendingGambitConversationsTemplate(t.context.req, t.context.res, template);
});

test('subscriptionStatusStop(): should call sendGambitConversationsTemplate', async (t) => {
  const template = templates.gambitConversationsTemplates.subscriptionStatusStop.name;
  await assertSendingGambitConversationsTemplate(t.context.req, t.context.res, template);
});

test('supportRequested(): should call sendGambitConversationsTemplate if no campaign is found', async (t) => {
  // Campaign is being set beforeEach test, so we need to unset it here
  t.context.req.campaign = undefined;
  const template = templates.gambitConversationsTemplates.supportRequested.name;
  await assertSendingGambitConversationsTemplate(t.context.req, t.context.res, template);
});

test('supportRequested(): should call sendReplyWithCampaignTemplate if campaign is found', async (t) => {
  const template = templates.memberSupport;
  await assertSendingReplyWithCampaignTemplate(t.context.req, t.context.res, template, 'supportRequested');
});

test('rivescriptReply(): should call sendReply', async (t) => {
  const template = templates.rivescriptReply;
  const text = 'some text';
  sandbox.stub(repliesHelper, 'sendReply')
    .returns(resolvedPromise);

  await repliesHelper.rivescriptReply(t.context.req, t.context.res, text);
  repliesHelper.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, text, template);
});
