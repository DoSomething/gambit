'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../../../lib/helpers');
const stubs = require('../../../../helpers/stubs');
const conversationFactory = require('../../../../helpers/factories/conversation');
const messageFactory = require('../../../../helpers/factories/message');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const createOutboundMessage = require('../../../../../lib/middleware/messages/message-outbound-create');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const mockConversation = conversationFactory.getValidConversation();
const mockMessage = messageFactory.getValidMessage();
const messageCreateStub = Promise.resolve(mockMessage);
const messageCreateFailStub = Promise.reject(new Error());
const configStub = stubs.config.getMessageOutbound();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  // add params
  t.context.req.outboundMessageText = stubs.getRandomMessageText();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('createOutboundMessage calls next if req.outboundMessage exists', async (t) => {
  const next = sinon.stub();
  sandbox.stub(mockConversation, 'createAndSetLastOutboundMessage')
    .returns(messageCreateStub);
  t.context.req.conversation = mockConversation;
  t.context.req.outboundMessage = mockMessage;
  const middleware = createOutboundMessage(configStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.have.been.called;
  t.context.req.conversation.createAndSetLastOutboundMessage.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('createOutboundMessage calls Conversation.createAndSetLastOutboundMessage with outboundMessageTemplate if set', async (t) => {
  const next = sinon.stub();
  sandbox.stub(mockConversation, 'createAndSetLastOutboundMessage')
    .returns(messageCreateStub);
  t.context.req.conversation = mockConversation;
  const template = stubs.getRandomWord();
  t.context.req.outboundMessageTemplate = template;
  const middleware = createOutboundMessage(configStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.conversation.createAndSetLastOutboundMessage.should.have.been.calledWith(
    configStub.messageDirection,
    t.context.req.outboundMessageText,
    template,
    t.context.req,
  );
  t.context.req.should.have.property('outboundMessage');
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('createOutboundMessage calls Conversation.createAndSetLastOutboundMessage with config.messageTemplate if outboundMessageTemplate undefined', async (t) => {
  const next = sinon.stub();
  sandbox.stub(mockConversation, 'createAndSetLastOutboundMessage')
    .returns(messageCreateStub);
  t.context.req.conversation = mockConversation;
  const signupConfigStub = stubs.config.getMessageOutbound(false, stubs.getRandomWord());
  const middleware = createOutboundMessage(signupConfigStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.conversation.createAndSetLastOutboundMessage.should.have.been.calledWith(
    signupConfigStub.messageDirection,
    t.context.req.outboundMessageText,
    signupConfigStub.messageTemplate,
    t.context.req,
  );
  t.context.req.should.have.property('outboundMessage');
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('createOutboundMessage calls sendErrorResponse if createAndSetLastOutboundMessage fails', async (t) => {
  const next = sinon.stub();
  sandbox.stub(mockConversation, 'createAndSetLastOutboundMessage')
    .returns(messageCreateFailStub);
  t.context.req.conversation = mockConversation;
  const middleware = createOutboundMessage(configStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.conversation.createAndSetLastOutboundMessage.should.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});
