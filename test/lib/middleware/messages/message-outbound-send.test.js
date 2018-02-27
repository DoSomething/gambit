'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../../lib/helpers');
const stubs = require('../../../helpers/stubs');
const conversationFactory = require('../../../helpers/factories/conversation');
const messageFactory = require('../../../helpers/factories/message');

const stubTwilioSuccess = stubs.twilio.getPostMessageSuccessBody();

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const sendOutbound = require('../../../../lib/middleware/messages/message-outbound-send');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const conversation = conversationFactory.getValidConversation();
const outboundMessage = messageFactory.getValidMessage();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendResponseWithMessage')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  t.context.req.conversation = conversation;
  t.context.req.outboundMessage = outboundMessage;
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('sendOutbound does not call postLastOutboundMessageToPlatform if not SMS', async (t) => {
  const next = sinon.stub();
  sandbox.stub(conversation, 'isSms')
    .returns(false);
  sandbox.stub(conversation, 'postLastOutboundMessageToPlatform')
    .returns(Promise.resolve(stubTwilioSuccess));
  const middleware = sendOutbound();

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.conversation.postLastOutboundMessageToPlatform.should.not.have.been.called;
  helpers.sendResponseWithMessage.should.have.been.calledWith(t.context.res, outboundMessage);
});

test('sendOutbound calls postLastOutboundMessageToPlatform for SMS', async (t) => {
  const next = sinon.stub();
  sandbox.stub(conversation, 'isSms')
    .returns(true);
  sandbox.stub(conversation, 'postLastOutboundMessageToPlatform')
    .returns(Promise.resolve(stubTwilioSuccess));
  const middleware = sendOutbound();

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.conversation.postLastOutboundMessageToPlatform.should.have.been.called;
  helpers.sendResponseWithMessage.should.have.been.calledWith(t.context.res, outboundMessage);
});
