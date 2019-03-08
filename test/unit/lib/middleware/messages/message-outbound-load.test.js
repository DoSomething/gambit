'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const Message = require('../../../../../app/models/Message');
const helpers = require('../../../../../lib/helpers');
const stubs = require('../../../../helpers/stubs');
const conversationFactory = require('../../../../helpers/factories/conversation');
const messageFactory = require('../../../../helpers/factories/message');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const loadOutbound = require('../../../../../lib/middleware/messages/message-outbound-load');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const configStub = stubs.config.getMessageOutbound();
const stubTrueIsARetryRequest = () => true;
const stubFalseIsARetryRequest = () => false;
const conversation = conversationFactory.getValidConversation();
const outboundMessage = messageFactory.getValidMessage();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  t.context.req.conversation = conversation;
  t.context.req.metadata = {
    requestId: stubs.getRequestId(),
  };
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('loadOutbound does not call updateMessageByRequestIdAndDirection if not retry', async (t) => {
  const next = sinon.stub();
  t.context.req.isARetryRequest = stubFalseIsARetryRequest;
  sandbox.stub(Message, 'updateMessageByRequestIdAndDirection')
    .returns(Promise.resolve(outboundMessage));
  const middleware = loadOutbound(configStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  Message.updateMessageByRequestIdAndDirection.should.not.have.been.called;
  next.should.have.been.called;
});

test('loadOutbound calls updateMessageByRequestIdAndDirection if retry', async (t) => {
  const next = sinon.stub();
  t.context.req.isARetryRequest = stubTrueIsARetryRequest;
  sandbox.stub(Message, 'updateMessageByRequestIdAndDirection')
    .returns(Promise.resolve(outboundMessage));
  sandbox.stub(t.context.req.conversation, 'setLastOutboundMessageProperties')
    .returns(Promise.resolve(outboundMessage));
  const middleware = loadOutbound(configStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  Message.updateMessageByRequestIdAndDirection.should.have.been.called;
  t.context.req.conversation.setLastOutboundMessage.should.have.been.called;
  t.context.req.should.have.property('outboundMessage');
  next.should.have.been.called;
});
