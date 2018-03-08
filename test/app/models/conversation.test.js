'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const Message = require('../../../app/models/Message');
const helpers = require('../../../lib/helpers');
const front = require('../../../lib/front');
const twilio = require('../../../lib/twilio');
const stubs = require('../../helpers/stubs');
const conversationFactory = require('../../helpers/factories/conversation');
const messageFactory = require('../../helpers/factories/message');
const userFactory = require('../../helpers/factories/user');

const tagsHelper = helpers.tags;
const conversation = conversationFactory.getValidConversation();
const alexaConversation = conversationFactory.getValidConversation('alexa');
const message = messageFactory.getValidMessage();
const mockMessageText = stubs.getRandomMessageText();
const mockUser = userFactory.getValidUser();
const resolvedPromise = Promise.resolve({});

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
// const Conversation = require('../../../app/models/Conversation');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.user, 'fetchById')
    .returns(mockUser);
  sandbox.stub(helpers.user, 'fetchByMobile')
    .returns(mockUser);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// createMessage
test('createMessage should call helpers.tag.render if direction is not inbound', async (t) => {
  sandbox.stub(tagsHelper, 'render')
    .returns(mockMessageText);
  sandbox.stub(Message, 'create')
    .returns(underscore.noop);

  await conversation.createMessage('outbound-api-send', mockMessageText, 'temp', t.context.req);
  tagsHelper.render.should.have.been.called;
  Message.create.should.have.been.called;
});

test('createMessage should not call helpers.tag.render if direction is inbound', async (t) => {
  sandbox.stub(tagsHelper, 'render')
    .returns(mockMessageText);
  sandbox.stub(Message, 'create')
    .returns(underscore.noop);

  await conversation.createMessage('inbound', mockMessageText, 'temp', t.context.req);
  tagsHelper.render.should.not.have.been.called;
  Message.create.should.have.been.called;
});

// postLastOutboundMessageToPlatform
test('postLastOutboundMessageToPlatform does not call twilio.postMessage if text undefined', async (t) => {
  sandbox.stub(twilio, 'postMessage')
    .returns(resolvedPromise);
  const supportConversation = conversationFactory.getValidConversation();
  supportConversation.lastOutboundMessage.text = '';
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
  t.context.req.conversation = conversation;

  await conversation.postLastOutboundMessageToPlatform(t.context.req);
  twilio.postMessage.should.have.been.called;
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
  t.context.req.conversation = conversation;

  await conversation.postMessageToSupport(t.context.req, message);
  front.postMessage.should.have.been.called;
});

// isSms
test('isSms should return boolean', (t) => {
  let result = conversation.isSms();
  t.truthy(result);

  result = alexaConversation.isSms();
  t.falsy(result);
});
