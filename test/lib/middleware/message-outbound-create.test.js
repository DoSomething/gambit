'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../lib/helpers');
const stubs = require('../../helpers/stubs');
const conversationFactory = require('../../helpers/factories/conversation');
const messageFactory = require('../../helpers/factories/message');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const createOutboundMessage = require('../../../lib/middleware/message-outbound-create');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const mockConversation = conversationFactory.getValidConversation();
const mockMessage = messageFactory.getValidMessage();
const messageCreateStub = Promise.resolve(mockMessage);
const messageCreateFailStub = Promise.reject(new Error());

const sendConfigStub = {
  messageDirection: 'outbound-api-send',
  shouldPostToPlatform: true,
};
const importConfigStub = {
  messageDirection: 'outbound-api-import',
  shouldPostToPlatform: false,
};

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  // add params
  t.context.req.outboundMessageText = stubs.getRandomMessageText();
  t.context.req.outboundTemplate = stubs.getTemplate();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('createOutboundMessage calls Conversation.createLastOutboundMessage', async (t) => {
  const next = sinon.stub();
  sandbox.stub(mockConversation, 'createLastOutboundMessage')
    .returns(messageCreateStub);
  sandbox.stub(mockConversation, 'postLastOutboundMessageToPlatform')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendResponseWithMessage')
    .returns(underscore.noop);
  t.context.req.conversation = mockConversation;
  const middleware = createOutboundMessage(sendConfigStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.conversation.createLastOutboundMessage.should.have.been.called;
  t.context.req.conversation.postLastOutboundMessageToPlatform.should.have.been.called;
  helpers.sendResponseWithMessage.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('createOutboundMessage does not post to platform if config is false', async (t) => {
  const next = sinon.stub();
  sandbox.stub(mockConversation, 'createLastOutboundMessage')
    .returns(messageCreateStub);
  sandbox.stub(mockConversation, 'postLastOutboundMessageToPlatform')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendResponseWithMessage')
    .returns(underscore.noop);
  t.context.req.conversation = mockConversation;
  const middleware = createOutboundMessage(importConfigStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.conversation.createLastOutboundMessage.should.have.been.called;
  t.context.req.conversation.postLastOutboundMessageToPlatform.should.not.have.been.called;
  helpers.sendResponseWithMessage.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('createOutboundMessage calls sendErrorResponse if createLastOutboundMessage fails', async (t) => {
  const next = sinon.stub();
  sandbox.stub(mockConversation, 'createLastOutboundMessage')
    .returns(messageCreateFailStub);
  sandbox.stub(mockConversation, 'postLastOutboundMessageToPlatform')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendResponseWithMessage')
    .returns(underscore.noop);
  t.context.req.conversation = mockConversation;
  const middleware = createOutboundMessage(sendConfigStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.conversation.createLastOutboundMessage.should.have.been.called;
  t.context.req.conversation.postLastOutboundMessageToPlatform.should.not.have.been.called;
  helpers.sendResponseWithMessage.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('createOutboundMessage calls sendErrorResponse if createLastOutboundMessage throws', async (t) => {
  const next = sinon.stub();
  sandbox.stub(mockConversation, 'createLastOutboundMessage')
    .returns(messageCreateStub);
  sandbox.stub(mockConversation, 'postLastOutboundMessageToPlatform')
    .throws();
  sandbox.stub(helpers, 'sendResponseWithMessage')
    .returns(underscore.noop);
  t.context.req.conversation = mockConversation;
  const middleware = createOutboundMessage(sendConfigStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.conversation.createLastOutboundMessage.should.have.been.called;
  t.context.req.conversation.postLastOutboundMessageToPlatform.should.have.been.called;
  helpers.sendResponseWithMessage.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});
