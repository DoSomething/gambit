'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const conversationFactory = require('../../../../../helpers/factories/conversation');

const resolvedPromise = Promise.resolve({});

chai.should();
chai.use(sinonChai);

// module to be tested
const supportRequested = require('../../../../../../lib/middleware/messages/member/support-requested');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.replies, 'supportRequested')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('supportRequested should call next if macro.isSupportRequested is false', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = supportRequested();
  const conversation = conversationFactory.getValidConversation();
  t.context.req.conversation = conversation;
  sandbox.stub(helpers.macro, 'isSupportRequested')
    .returns(false);
  sandbox.stub(conversation, 'setSupportTopic')
    .returns(resolvedPromise);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.isSupportRequested.should.have.been.called;
  next.should.have.been.called;
  conversation.setSupportTopic.should.not.have.been.called;
  helpers.replies.supportRequested.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('supportRequested should call setSupportTopic if macro.isSupportRequested is true', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = supportRequested();
  const conversation = conversationFactory.getValidConversation();
  t.context.req.conversation = conversation;
  sandbox.stub(helpers.macro, 'isSupportRequested')
    .returns(true);
  sandbox.stub(conversation, 'setSupportTopic')
    .returns(resolvedPromise);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.isSupportRequested.should.have.been.called;
  next.should.not.have.been.called;
  conversation.setSupportTopic.should.have.been.called;
  helpers.replies.supportRequested.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('supportMessage should call sendErrorResponse if postMessageToSupport fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = supportRequested();
  const conversation = conversationFactory.getValidConversation();
  t.context.req.conversation = conversation;
  sandbox.stub(helpers.macro, 'isSupportRequested')
    .returns(true);
  sandbox.stub(conversation, 'setSupportTopic')
    .returns(Promise.reject('Epic fail'));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.isSupportRequested.should.have.been.called;
  next.should.not.have.been.called;
  conversation.setSupportTopic.should.have.been.called;
  helpers.replies.supportRequested.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});
