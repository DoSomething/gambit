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
const userFactory = require('../../../helpers/factories/user');

const config = require('../../../../config/lib/helpers/replies');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const repliesHelper = require('../../../../lib/helpers/replies');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// misc helper vars
const templates = templatesConfig.templatesMap;
const resolvedPromise = Promise.resolve({});
const rejectedPromise = Promise.reject({});

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  sandbox.stub(helpers, 'sendErrorResponse').returns(() => {});
  sandbox.stub(helpers.errorNoticeable, 'sendErrorResponse').returns(() => {});
  t.context.req.campaign = campaignFactory.getValidCampaign();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

// Assert helper functions
// TODO: Maybe move to own asserts module?
async function assertSendingReplyWithTopicTemplate(
  req,
  res,
  template,
  replyName
) {
  sandbox
    .stub(repliesHelper, 'sendReplyWithTopicTemplate')
    .returns(resolvedPromise);

  await repliesHelper[replyName || template](req, res);
  repliesHelper.sendReplyWithTopicTemplate.should.have.been.calledWith(
    req,
    res,
    template
  );
}

async function assertSendingStaticTemplate(req, res, template) {
  sandbox
    .stub(repliesHelper, 'sendReplyWithStaticTemplate')
    .returns(resolvedPromise);

  await repliesHelper[template](req, res);
  repliesHelper.sendReplyWithStaticTemplate.should.have.been.calledWith(
    req,
    res,
    template
  );
}

function getReqWithProps(opts = {}) {
  const req = httpMocks.createRequest();
  req.metadata = {};
  req.isARetryRequest =
    opts.isARetryRequest ||
    function () {
      return false;
    };
  req.inboundMessage = opts.inboundMessage;
  req.conversation =
    opts.conversation || conversationFactory.getValidConversation();
  req.conversation.lastOutboundMessage = opts.lastOutboundMessage;
  req.outboundMessage = opts.outboundMessage;
  req.user = opts.user;
  return req;
}

/**
 * Tests --------------------------------------------------
 */

test('sendReply(): sends error if updateByMemberMessageReq fails', async (t) => {
  // setup
  const user = userFactory.getValidUser();
  const req = getReqWithProps({
    user,
  });

  sandbox
    .stub(helpers.user, 'updateByMemberMessageReq')
    .throws('error updating user');

  // test
  await repliesHelper.sendReply(
    req,
    t.context.res,
    'text',
    templates.campaignClosed
  );

  // asserts
  helpers.errorNoticeable.sendErrorResponse.should.have.been.called;
});

test('sendReply(): responds with the inbound and outbound messages if member is subscribed', async (t) => {
  // setup
  const inboundMessage = messageFactory.getValidMessage();
  const lastOutboundMessage = messageFactory.getValidOutboundReplyMessage();
  const user = userFactory.getValidUser();
  const req = getReqWithProps({
    inboundMessage,
    lastOutboundMessage,
    user,
  });

  sandbox
    .stub(helpers.user, 'updateByMemberMessageReq')
    .returns(Promise.resolve(user));
  sandbox
    .stub(req.conversation, 'createAndSetLastOutboundMessage')
    .returns(resolvedPromise);
  sandbox
    .stub(req.conversation, 'postLastOutboundMessageToPlatform')
    .returns(resolvedPromise);
  sandbox.spy(helpers.response, 'sendData');

  // test
  await repliesHelper.sendReply(
    req,
    t.context.res,
    'text line',
    templates.campaignClosed
  );
  const responseMessages = helpers.response.sendData.getCall(0).args[1]
    .messages;

  // asserts
  helpers.response.sendData.should.have.been.called;
  helpers.user.updateByMemberMessageReq.should.have.been.calledWith(req);
  req.conversation.createAndSetLastOutboundMessage.should.have.been.called;
  req.conversation.postLastOutboundMessageToPlatform.should.have.been.called;
  responseMessages.inbound[0].should.be.equal(inboundMessage);
  responseMessages.outbound[0].should.be.equal(lastOutboundMessage);
});

test('sendReply(): should not call createAndSetLastOutboundMessage if outbound message has been loaded', async (t) => {
  // setup
  const outboundMessage = messageFactory.getValidOutboundReplyMessage();
  const user = userFactory.getValidUser();
  const req = getReqWithProps({
    lastOutboundMessage: outboundMessage,
    outboundMessage,
    isARetryRequest: () => true,
    user,
  });
  sandbox
    .stub(helpers.user, 'updateByMemberMessageReq')
    .returns(Promise.resolve(user));
  sandbox
    .stub(req.conversation, 'createAndSetLastOutboundMessage')
    .returns(resolvedPromise);
  sandbox
    .stub(req.conversation, 'postLastOutboundMessageToPlatform')
    .returns(resolvedPromise);
  sandbox
    .stub(Message, 'updateMessageByRequestIdAndDirection')
    .returns(resolvedPromise);

  // test
  await repliesHelper.sendReply(
    req,
    t.context.res,
    'text line',
    templates.campaignClosed
  );

  // asserts
  req.conversation.createAndSetLastOutboundMessage.should.not.have.been.called;
  req.conversation.postLastOutboundMessageToPlatform.should.have.been.called;
});

test('sendReply(): should createAndSetLastOutboundMessage outbound message if no outboundMessage was loaded on a retry', async (t) => {
  // setup
  const inboundMessage = messageFactory.getValidMessage();
  const lastOutboundMessage = messageFactory.getValidOutboundReplyMessage();
  const user = userFactory.getValidUser();
  const req = getReqWithProps({
    inboundMessage,
    lastOutboundMessage,
    isARetryRequest: () => true,
    user,
  });
  sandbox
    .stub(helpers.user, 'updateByMemberMessageReq')
    .returns(Promise.resolve(user));
  sandbox
    .stub(req.conversation, 'createAndSetLastOutboundMessage')
    .returns(resolvedPromise);
  sandbox
    .stub(req.conversation, 'postLastOutboundMessageToPlatform')
    .returns(resolvedPromise);

  // test
  await repliesHelper.sendReply(
    req,
    t.context.res,
    'text line',
    templates.campaignClosed
  );

  // asserts
  req.conversation.createAndSetLastOutboundMessage.should.have.been.called;
  req.conversation.postLastOutboundMessageToPlatform.should.have.been.called;
});

test('sendReply(): should call sendErrorResponse on failure', async (t) => {
  // setup
  const user = userFactory.getValidUser();
  const req = getReqWithProps({ user });
  sandbox
    .stub(helpers.user, 'updateByMemberMessageReq')
    .returns(Promise.resolve(user));
  sandbox
    .stub(req.conversation, 'createAndSetLastOutboundMessage')
    .returns(rejectedPromise);

  // test
  await repliesHelper.sendReply(
    req,
    t.context.res,
    'text line',
    templates.campaignClosed
  );

  // asserts
  helpers.errorNoticeable.sendErrorResponse.should.have.been.called;
});

test('askPhoto(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.askPhoto;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('askQuantity(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.askQuantity;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('askWhyParticipated(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.askWhyParticipated;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('autoReply(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.autoReply;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('campaignClosed(): should call sendWithStaticTemplate', async (t) => {
  const templateName = config.campaignClosed.name;
  await assertSendingStaticTemplate(t.context.req, t.context.res, templateName);
});

test('completedPhotoPost(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.completedPhotoPost;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('completedTextPost(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.completedTextPost;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('invalidAskYesNoResponse(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.invalidAskYesNoResponse;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('invalidPhoto(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.invalidPhoto;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('invalidQuantity(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.invalidQuantity;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('invalidText(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.invalidText;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('invalidWhyParticipated(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.invalidWhyParticipated;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('startPhotoPostAutoReply(): should call sendReplyWithTopicTemplate', async (t) => {
  const template = templates.topicTemplates.startPhotoPostAutoReply;
  await assertSendingReplyWithTopicTemplate(
    t.context.req,
    t.context.res,
    template
  );
});

test('templates.campaignClosed(): should return campaignClosed config', () => {
  const result = repliesHelper.templates.campaignClosed();
  result.should.deep.equal(config.campaignClosed);
});

test('templates.subscriptionStatusActive(): should return subscriptionStatusActive macro', () => {
  const result = repliesHelper.templates.subscriptionStatusActive();
  result.should.deep.equal(helpers.macro.getMacro('subscriptionStatusActive'));
});

test('badWords(): should call sendReplyWithStaticTemplate', async (t) => {
  const template = config.badWords.name;
  await assertSendingStaticTemplate(t.context.req, t.context.res, template);
});

test('noCampaign(): should call sendReplyWithStaticTemplate', async (t) => {
  const template = config.noCampaign.name;
  await assertSendingStaticTemplate(t.context.req, t.context.res, template);
});

test('noReply(): should call sendReplyWithStaticTemplate', async (t) => {
  const template = config.noReply.name;
  await assertSendingStaticTemplate(t.context.req, t.context.res, template);
});

test('rivescriptReply(): should call sendReply', async (t) => {
  const template = templates.rivescriptReply;
  const text = 'some text';
  sandbox.stub(repliesHelper, 'sendReply').returns(resolvedPromise);

  await repliesHelper.rivescriptReply(t.context.req, t.context.res, text);
  repliesHelper.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    text,
    template
  );
});

test('saidNo(): should call sendReply', async (t) => {
  const template = templates.topicTemplates.saidNo;
  const text = 'some text';
  sandbox.stub(repliesHelper, 'sendReply').returns(resolvedPromise);

  await repliesHelper.saidNo(t.context.req, t.context.res, text);
  repliesHelper.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    text,
    template
  );
});

test('saidYes(): should call sendReply', async (t) => {
  const template = templates.topicTemplates.saidYes;
  const text = 'some text';
  sandbox.stub(repliesHelper, 'sendReply').returns(resolvedPromise);

  await repliesHelper.saidYes(t.context.req, t.context.res, text);
  repliesHelper.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    text,
    template
  );
});
