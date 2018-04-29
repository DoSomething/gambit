'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const Message = require('../../../../app/models/Message');
const helpers = require('../../../../lib/helpers');
const front = require('../../../../lib/front');
const twilio = require('../../../../lib/twilio');
const stubs = require('../../../helpers/stubs');
const conversationFactory = require('../../../helpers/factories/conversation');
const messageFactory = require('../../../helpers/factories/message');

const config = require('../../../../config/app/models/conversation');

const tagsHelper = helpers.tags;
const topics = config.topics;
const smsConversation = conversationFactory.getValidConversation();
const alexaConversation = conversationFactory.getValidConversation('alexa');
const supportConversation = conversationFactory.getValidSupportConversation();
const message = messageFactory.getValidMessage();
const mockMessageText = stubs.getRandomMessageText();
const resolvedPromise = Promise.resolve({});

chai.should();
chai.use(sinonChai);
const expect = chai.expect;

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

test('postLastOutboundMessageToPlatform should save metadata conversation when POST to Twilio is successful', async (t) => {
  const postMessageResponse = Promise.resolve(stubs.twilio.getPostMessageSuccess());
  sandbox.stub(twilio, 'postMessage')
    .returns(postMessageResponse);
  sandbox.stub(smsConversation.lastOutboundMessage, 'save')
    .returns(resolvedPromise);
  t.context.req.conversation = smsConversation;

  await smsConversation.postLastOutboundMessageToPlatform(t.context.req);
  twilio.postMessage.should.have.been.called;
  smsConversation.lastOutboundMessage.save.should.have.been.called;
  expect(smsConversation.lastOutboundMessage.metadata.delivery.queuedAt).to.exist;
  expect(smsConversation.lastOutboundMessage.metadata.delivery.totalSegments).to.exist;
});

test('postLastOutboundMessageToPlatform should save metadata conversation when Twilio responds with an error', async (t) => {
  const postMessageResponse = Promise.reject(stubs.twilio.getPostMessageError());
  sandbox.stub(twilio, 'postMessage')
    .returns(postMessageResponse);
  sandbox.stub(smsConversation.lastOutboundMessage, 'save')
    .returns(resolvedPromise);
  t.context.req.conversation = smsConversation;

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
  smsConversation.lastOutboundMessage.save.should.have.been.called;
  expect(smsConversation.lastOutboundMessage.metadata.delivery.failedAt).to.exist;
  expect(smsConversation.lastOutboundMessage.metadata.delivery.failureData).to.exist;
  expect(smsConversation.lastOutboundMessage.metadata.delivery.failureData.code).to.exist;
  expect(smsConversation.lastOutboundMessage.metadata.delivery.failureData.message).to.exist;
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

// setTopic
test('setTopic calls save for new topic', async () => {
  const mockConversation = conversationFactory.getValidConversation();
  const mockTopic = 'lannisters';
  sandbox.stub(mockConversation, 'save')
    .returns(Promise.resolve(mockConversation));

  await mockConversation.setTopic(mockTopic);
  mockConversation.save.should.have.been.called;
});

test('setTopic does not call save for same topic', async () => {
  const mockConversation = conversationFactory.getValidConversation();
  sandbox.stub(mockConversation, 'save')
    .returns(Promise.resolve(mockConversation));

  await mockConversation.setTopic(mockConversation.topic);
  mockConversation.save.should.not.have.been.called;
});

test('setDefaultTopic, setSupportTopic, setCampaignTopic call setTopic', async () => {
  const mockConversation = conversationFactory.getValidConversation();
  sandbox.stub(mockConversation, 'setTopic')
    .returns(Promise.resolve(mockConversation));

  await mockConversation.setDefaultTopic();
  mockConversation.setTopic.should.have.been.calledWith(topics.default);

  await mockConversation.setCampaignTopic();
  mockConversation.setTopic.should.have.been.calledWith(topics.campaign);

  await mockConversation.setSupportTopic();
  mockConversation.setTopic.should.have.been.calledWith(topics.support);
});
