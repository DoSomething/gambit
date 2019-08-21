'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const Conversation = require('../../../../app/models/Conversation');
const DraftSubmission = require('../../../../app/models/DraftSubmission');
const Message = require('../../../../app/models/Message');
const helpers = require('../../../../lib/helpers');
const front = require('../../../../lib/front');
const twilio = require('../../../../lib/twilio');
const stubs = require('../../../helpers/stubs');
const conversationFactory = require('../../../helpers/factories/conversation');
const messageFactory = require('../../../helpers/factories/message');
const topicFactory = require('../../../helpers/factories/topic');

const tagsHelper = helpers.tags;
const smsConversation = conversationFactory.getValidConversation();
const alexaConversation = conversationFactory.getValidConversation('alexa');
const supportConversation = conversationFactory.getValidSupportConversation();
const message = messageFactory.getValidMessage();
const mockMessageText = stubs.getRandomMessageText();
const resolvedPromise = Promise.resolve({});

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  t.context = {};
  sandbox.restore();
});

// createMessage
test('createMessage should call helpers.tag.render if direction is not inbound', async (t) => {
  sandbox.stub(tagsHelper, 'render')
    .returns(mockMessageText);
  sandbox.stub(Message, 'create')
    .returns(underscore.noop);

  await smsConversation.createMessage('outbound-api-send', mockMessageText, 'temp', t.context.req);
  tagsHelper.render.should.have.been.called;
  Message.create.should.have.been.called;
});

test('createMessage should not call helpers.tag.render if direction is inbound', async (t) => {
  sandbox.stub(tagsHelper, 'render')
    .returns(mockMessageText);
  sandbox.stub(Message, 'create')
    .returns(underscore.noop);

  await smsConversation.createMessage('inbound', mockMessageText, 'temp', t.context.req);
  tagsHelper.render.should.not.have.been.called;
  Message.create.should.have.been.called;
});

// isSms
test('isSms should return boolean', (t) => {
  let result = smsConversation.isSms();
  t.truthy(result);

  result = alexaConversation.isSms();
  t.falsy(result);
});

// isSupportTopic
test('isSupportTopic should return boolean', (t) => {
  let result = smsConversation.isSupportTopic();
  t.falsy(result);

  result = supportConversation.isSupportTopic();
  t.truthy(result);
});

// postLastOutboundMessageToPlatform
test('postLastOutboundMessageToPlatform does not call twilio.postMessage if text undefined', async (t) => {
  sandbox.stub(twilio, 'postMessage')
    .returns(resolvedPromise);
  t.context.req.conversation = supportConversation;

  await supportConversation.postLastOutboundMessageToPlatform(t.context.req);
  twilio.postMessage.should.not.have.been.called;
});

test('postLastOutboundMessageToPlatform does not call twilio.postMessage if conversation is not SMS', async (t) => {
  sandbox.stub(twilio, 'postMessage')
    .returns(resolvedPromise);
  t.context.req.conversation = alexaConversation;

  await alexaConversation.postLastOutboundMessageToPlatform(t.context.req);
  twilio.postMessage.should.not.have.been.called;
});

test('postLastOutboundMessageToPlatform calls twilio.postMessage if conversation is SMS', async (t) => {
  sandbox.stub(twilio, 'postMessage')
    .returns(resolvedPromise);
  sandbox.stub(smsConversation.lastOutboundMessage, 'save')
    .returns(resolvedPromise);
  t.context.req.conversation = smsConversation;

  await smsConversation.postLastOutboundMessageToPlatform(t.context.req);
  twilio.postMessage.should.have.been.called;
});

test('postLastOutboundMessageToPlatform should call handleMessageCreationSuccess when POST to Twilio is successful', async (t) => {
  const postMessageResponse = stubs.twilio.getPostMessageSuccess();
  sandbox.stub(twilio, 'postMessage')
    .returns(Promise.resolve(postMessageResponse));
  sandbox.stub(helpers.twilio, 'handleMessageCreationSuccess')
    .returns(Promise.resolve());

  await smsConversation.postLastOutboundMessageToPlatform(t.context.req);
  twilio.postMessage.should.have.been.called;
  helpers.twilio.handleMessageCreationSuccess
    .should.have.been.calledWith(postMessageResponse, smsConversation.lastOutboundMessage);
});

test('postLastOutboundMessageToPlatform should call handleMessageCreationFailure when Twilio responds with an error', async (t) => {
  const postMessageResponse = stubs.twilio.getPostMessageError();
  sandbox.stub(twilio, 'postMessage')
    .returns(Promise.reject(postMessageResponse));
  sandbox.stub(helpers.twilio, 'handleMessageCreationFailure')
    .returns(Promise.resolve());

  try {
    await smsConversation.postLastOutboundMessageToPlatform(t.context.req);
  } catch (error) {
    /**
     * We don't do anything here. IRL this error would bubble up the catch chain and
     * trigger a retry by Blink or would suppress the error is it's an unrecoverable Twilio
     * error.
     */
  }
  twilio.postMessage.should.have.been.called;
  helpers.twilio.handleMessageCreationFailure
    .should.have.been.calledWith(postMessageResponse, smsConversation.lastOutboundMessage);
});

// postMessageToSupport
test('postMessageToSupport does not call front.postMessage if conversation is not SMS', async (t) => {
  sandbox.stub(front, 'postMessage')
    .returns(resolvedPromise);
  t.context.req.conversation = alexaConversation;

  await alexaConversation.postMessageToSupport(t.context.req, message);
  front.postMessage.should.not.have.been.called;
});

test('postMessageToSupport calls front.postMessage if conversation is SMS', async (t) => {
  sandbox.stub(front, 'postMessage')
    .returns(resolvedPromise);
  t.context.req.userId = stubs.getUserId();
  t.context.req.conversation = smsConversation;

  await smsConversation.postMessageToSupport(t.context.req, message);
  front.postMessage.should.have.been.calledWith(t.context.req.userId, message.text);
});

// setDefaultTopic
test('setDefaultTopic calls setTopic with default topic', async () => {
  const mockConversation = conversationFactory.getValidConversation();
  const mockTopic = { id: 'dragons' };
  sandbox.stub(helpers.topic, 'getDefaultTopic')
    .returns(mockTopic);
  sandbox.stub(mockConversation, 'setTopic')
    .returns(Promise.resolve(mockConversation));

  await mockConversation.setDefaultTopic();
  mockConversation.setTopic.should.have.been.calledWith(mockTopic);
});

// setSupportTopic
test('setSupportTopic calls setTopic with support topic', async () => {
  const mockConversation = conversationFactory.getValidConversation();
  const mockTopic = { id: 'dragons' };
  sandbox.stub(helpers.topic, 'getSupportTopic')
    .returns(mockTopic);
  sandbox.stub(mockConversation, 'setTopic')
    .returns(Promise.resolve(mockConversation));

  await mockConversation.setSupportTopic();
  mockConversation.setTopic.should.have.been.calledWith(mockTopic);
});

// setTopic
test('setTopic calls save for new topic', async () => {
  const mockConversation = conversationFactory.getValidConversation();
  const mockTopic = topicFactory.getValidTopic();
  const mockResult = conversationFactory.getValidConversation();
  mockResult.topic = mockTopic.id;
  sandbox.stub(mockConversation, 'save')
    .returns(Promise.resolve(mockResult));

  await mockConversation.setTopic(mockTopic);
  mockConversation.save.should.have.been.called;
  mockConversation.topic.should.equal(mockResult.topic);
});

test('anonymizePIIByUserId should call Conversation.findOneAndUpdate, DraftSubmission.remove, and Message.updateMany if a valid userId is provided', async () => {
  const conversation = conversationFactory.getValidConversation();
  sandbox.stub(Conversation, 'findOneAndUpdate').returns({
    exec: () => Promise.resolve(conversation),
  });
  sandbox.stub(DraftSubmission, 'remove').returns({
    exec: () => Promise.resolve(true),
  });
  sandbox.stub(Message, 'updateMany').returns({
    exec: () => Promise.resolve(true),
  });
  await Conversation.anonymizePIIByUserId(conversation.userId);

  Conversation.findOneAndUpdate.should.have.been.called;
  DraftSubmission.remove.should.have.been.called;
  Message.updateMany.should.have.been.called;
});

test('anonymizePIIByUserId should not call findOneAndUpdate if userId is undefined', async () => {
  let anonymizationError;
  sandbox.spy(Conversation, 'findOneAndUpdate');
  sandbox.spy(DraftSubmission, 'remove');
  try {
    await Conversation.anonymizePIIByUserId();
  } catch (error) {
    anonymizationError = error;
  }
  anonymizationError.should.not.be.null;
  Conversation.findOneAndUpdate.should.not.have.been.called;
  DraftSubmission.remove.should.not.have.been.called;
});

test('anonymizePIIByUserId should not call DraftSubmission.remove or Message.updateMany if userId is defined but no conversation is found', async () => {
  let anonymizationError;
  const mockConversationId = stubs.getRandomStringNumber();
  sandbox.stub(Conversation, 'findOneAndUpdate').returns({
    exec: () => Promise.resolve(null),
  });
  sandbox.spy(DraftSubmission, 'remove');
  sandbox.spy(Message, 'updateMany');

  try {
    await Conversation.anonymizePIIByUserId(mockConversationId);
  } catch (error) {
    anonymizationError = error;
  }

  anonymizationError.should.not.be.null;
  anonymizationError.status.should.be.equal(404);
  Conversation.findOneAndUpdate.should.have.been.called;
  DraftSubmission.remove.should.not.have.been.called;
  Message.updateMany.should.not.have.been.called;
});
