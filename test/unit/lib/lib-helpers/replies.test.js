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
const helpers = require('../../../../lib/helpers');
const templatesConfig = require('../../../../config/lib/helpers/template');
const Message = require('../../../../app/models/Message');
const campaignFactory = require('../../../helpers/factories/campaign');
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
const gambitConversationsTemplates = templates.gambitConversationsTemplates;
const resolvedPromise = Promise.resolve({});
const rejectedPromise = Promise.reject({});

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(() => {});
  t.context.req.campaign = campaignFactory.getValidCampaign();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

// Assert helper functions
// TODO: Maybe move to own asserts module?
async function assertSendingReplyWithTopicTemplate(req, res, template, replyName) {
  sandbox.stub(repliesHelper, 'sendReplyWithTopicTemplate')
    .returns(resolvedPromise);

  await repliesHelper[replyName || template](req, res);
  repliesHelper.sendReplyWithTopicTemplate
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
test('sendReply(): sends error if updateByMemberMessageReq fails', async (t) => {
  // setup
  const error = { message: 'Epic fail' };
  sandbox.stub(helpers.user, 'updateByMemberMessageReq')
    .returns(Promise.reject(error));
  // test
  await repliesHelper.sendReply(t.context.req, t.context.res, 'text', templates.campaignClosed);

  // asserts
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});

test('sendReply(): responds with the inbound and outbound messages', async (t) => {
  // setup
  const inboundMessage = messageFactory.getValidMessage();
  const lastOutboundMessage = messageFactory.getValidOutboundReplyMessage();
  const req = getReqWithProps({
    inboundMessage,
    lastOutboundMessage,
  });
  sandbox.stub(helpers.user, 'updateByMemberMessageReq')
    .returns(Promise.resolve({}));
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
  sandbox.stub(helpers.user, 'updateByMemberMessageReq')
    .returns(Promise.resolve({}));
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
  sandbox.stub(helpers.user, 'updateByMemberMessageReq')
    .returns(Promise.resolve({}));
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
  sandbox.stub(helpers.user, 'updateByMemberMessageReq')
    .returns(Promise.resolve({}));
  sandbox.stub(req.conversation, 'createAndSetLastOutboundMessage')
    .returns(rejectedPromise);

  // test
  await repliesHelper.sendReply(req, t.context.res, 'text line', templates.campaignClosed);

  // asserts
  helpers.sendErrorResponse.should.have.been.called;
});

test('autoReply(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.gambitCampaignsTemplates.autoReply;
  await assertSendingReplyWithTopicTemplate(t.context.req, t.context.res, template);
});

test('continueTopic(): sendReplyWithTopicTemplate should be called', async (t) => {
  sandbox.stub(helpers.request, 'postCampaignActivity')
    .returns(Promise.resolve(gCampResponse.data));
  sandbox.stub(repliesHelper, 'sendReplyWithTopicTemplate')
    .returns(resolvedPromise);

  await repliesHelper.continueTopic(t.context.req, t.context.res);
  repliesHelper.sendReplyWithTopicTemplate.should.have.been.called;
});

test('continueTopic(): helpers.sendErrorResponse should be called if postCampaignActivity fails', async (t) => {
  sandbox.stub(helpers.request, 'postCampaignActivity')
    .returns(Promise.reject(gCampResponse.data));
  sandbox.stub(repliesHelper, 'sendReplyWithTopicTemplate')
    .returns(resolvedPromise);

  await repliesHelper.continueTopic(t.context.req, t.context.res);
  repliesHelper.sendReplyWithTopicTemplate.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('continueTopic(): should call noCampaign if req.campaign undefined', async (t) => {
  t.context.req.campaign = null;
  sandbox.stub(repliesHelper, 'noCampaign')
    .returns(resolvedPromise);

  await repliesHelper.continueTopic(t.context.req, t.context.res);
  repliesHelper.noCampaign.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('askContinue(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.askContinueTemplates.askContinue;
  await assertSendingReplyWithTopicTemplate(t.context.req, t.context.res, template);
});

test('campaignClosed(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.campaignClosed;
  await assertSendingReplyWithTopicTemplate(t.context.req, t.context.res, template);
});

test('confirmedContinue(): should call continueTopic', async (t) => {
  sandbox.stub(repliesHelper, 'continueTopic')
    .returns(resolvedPromise);

  await repliesHelper.confirmedContinue(t.context.req, t.context.res);
  repliesHelper.continueTopic.should.have.been.called;
  // TODO: Should not be testing hardcoded strings
  repliesHelper.continueTopic.getCall(0).args[0].keyword.should.equal('continue');
});

test('declinedContinue(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.declinedContinue;
  await assertSendingReplyWithTopicTemplate(t.context.req, t.context.res, template);
});

test('invalidAskYesNoResponse(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.gambitCampaignsTemplates.invalidAskYesNoResponse;
  await assertSendingReplyWithTopicTemplate(t.context.req, t.context.res, template);
});

test('invalidAskContinueResponse(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.askContinueTemplates.invalidAskContinueResponse;
  await assertSendingReplyWithTopicTemplate(t.context.req, t.context.res, template);
});

test('badWords(): should call sendGambitConversationsTemplate', async (t) => {
  const template = gambitConversationsTemplates.badWords.name;
  await assertSendingGambitConversationsTemplate(t.context.req, t.context.res, template);
});


test('noCampaign(): should call sendGambitConversationsTemplate', async (t) => {
  const template = gambitConversationsTemplates.noCampaign.name;
  await assertSendingGambitConversationsTemplate(t.context.req, t.context.res, template);
});

test('noReply(): should call sendGambitConversationsTemplate', async (t) => {
  sandbox.stub(repliesHelper, 'sendReply')
    .returns(resolvedPromise);
  await repliesHelper.noReply(t.context.req, t.context.res);
  repliesHelper.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, '', 'noReply');
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

test('saidNo(): should call sendReply', async (t) => {
  const template = templates.gambitCampaignsTemplates.saidNo;
  const text = 'some text';
  sandbox.stub(repliesHelper, 'sendReply')
    .returns(resolvedPromise);

  await repliesHelper.saidNo(t.context.req, t.context.res, text);
  repliesHelper.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, text, template);
});

test('saidYes(): should call sendReply', async (t) => {
  const template = templates.gambitCampaignsTemplates.saidYes;
  const text = 'some text';
  sandbox.stub(repliesHelper, 'sendReply')
    .returns(resolvedPromise);

  await repliesHelper.saidYes(t.context.req, t.context.res, text);
  repliesHelper.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, text, template);
});
