'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../lib/helpers');
const conversationFactory = require('../../../../helpers/factories/conversation');

const resolvedPromise = Promise.resolve({});

chai.should();
chai.use(sinonChai);

// module to be tested
const supportMessage = require('../../../../../lib/middleware/messages/member/support-message');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.replies, 'noReply')
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

test('supportMessage should call next if conversation is not in support', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = supportMessage();
  const conversation = conversationFactory.getValidConversation();
  t.context.req.conversation = conversation;
  sandbox.stub(conversation, 'isSupportTopic')
    .returns(false);
  sandbox.stub(conversation, 'postMessageToSupport')
    .returns(resolvedPromise);

  // test
  await middleware(t.context.req, t.context.res, next);
  conversation.isSupportTopic.should.have.been.called;
  next.should.have.been.called;
  conversation.postMessageToSupport.should.not.have.been.called;
  helpers.replies.noReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('supportMessage should call postMessageToSupport if conversation is in support', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = supportMessage();
  const conversation = conversationFactory.getValidConversation();
  t.context.req.conversation = conversation;
  sandbox.stub(conversation, 'isSupportTopic')
    .returns(true);
  sandbox.stub(conversation, 'postMessageToSupport')
    .returns(resolvedPromise);

  // test
  await middleware(t.context.req, t.context.res, next);
  conversation.isSupportTopic.should.have.been.called;
  next.should.not.have.been.called;
  conversation.postMessageToSupport.should.have.been.called;
  helpers.replies.noReply.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('supportMessage should call sendErrorResponse if postMessageToSupport fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = supportMessage();
  const conversation = conversationFactory.getValidConversation();
  t.context.req.conversation = conversation;
  sandbox.stub(conversation, 'isSupportTopic')
    .returns(true);
  sandbox.stub(conversation, 'postMessageToSupport')
    .returns(Promise.reject('Epic fail'));

  // test
  await middleware(t.context.req, t.context.res, next);
  conversation.isSupportTopic.should.have.been.called;
  next.should.not.have.been.called;
  conversation.postMessageToSupport.should.have.been.called;
  helpers.replies.noReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});
