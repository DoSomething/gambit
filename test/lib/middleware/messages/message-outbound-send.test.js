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

const twilioSuccessStub = stubs.twilio.getPostMessageSuccessBody();
const twilioErrorStub = stubs.twilio.getPostMessageError();

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
  sandbox.stub(helpers, 'sendErrorResponseWithSuppressHeaders')
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

test('sendOutbound does not call helpers.user.sendTwilioMessage if not SMS', async (t) => {
  const next = sinon.stub();
  sandbox.stub(conversation, 'isSms')
    .returns(false);
  sandbox.stub(helpers.user, 'sendTwilioMessage')
    .returns(Promise.resolve(twilioSuccessStub));
  const middleware = sendOutbound();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.user.sendTwilioMessage.should.not.have.been.called;
  helpers.sendResponseWithMessage.should.have.been.calledWith(t.context.res, outboundMessage);
});

test('sendOutbound calls helpers.user.sendTwilioMessage for SMS', async (t) => {
  const next = sinon.stub();
  sandbox.stub(conversation, 'isSms')
    .returns(true);
  sandbox.stub(helpers.user, 'sendTwilioMessage')
    .returns(Promise.resolve(twilioSuccessStub));
  const middleware = sendOutbound();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.user.sendTwilioMessage.should.have.have.been.called;
  helpers.sendResponseWithMessage.should.have.been.calledWith(t.context.res, outboundMessage);
});

test('sendOutbound calls sendErrorResponseWithSuppressHeaders if Twilio bad request', async (t) => {
  const next = sinon.stub();
  sandbox.stub(conversation, 'isSms')
    .returns(true);
  sandbox.stub(helpers.user, 'sendTwilioMessage')
    .returns(Promise.reject(twilioErrorStub));
  sandbox.stub(helpers.twilio, 'isBadRequestError')
    .returns(true);
  sandbox.stub(helpers.analytics, 'addTwilioError')
    .returns(underscore.noop);
  const middleware = sendOutbound();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.user.sendTwilioMessage.should.have.have.been.called;
  helpers.analytics.addTwilioError.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
  helpers.sendErrorResponseWithSuppressHeaders.should.have.been.called;
  helpers.sendResponseWithMessage.should.not.have.been.called;
});

test('sendOutbound calls sendErrorResponse if error is not Twilio bad request', async (t) => {
  const next = sinon.stub();
  sandbox.stub(conversation, 'isSms')
    .returns(true);
  sandbox.stub(helpers.user, 'sendTwilioMessage')
    .returns(Promise.reject(twilioErrorStub));
  sandbox.stub(helpers.twilio, 'isBadRequestError')
    .returns(false);
  sandbox.stub(helpers.analytics, 'addTwilioError')
    .returns(underscore.noop);
  const middleware = sendOutbound();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.user.sendTwilioMessage.should.have.been.called;
  helpers.analytics.addTwilioError.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  helpers.sendErrorResponseWithSuppressHeaders.should.not.have.been.called;
  helpers.sendResponseWithMessage.should.not.have.been.called;
});
