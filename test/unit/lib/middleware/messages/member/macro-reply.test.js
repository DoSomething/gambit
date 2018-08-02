'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const stubs = require('../../../../../helpers/stubs');
const conversationFactory = require('../../../../../helpers/factories/conversation');

chai.should();
chai.use(sinonChai);

// module to be tested
const replyMacro = require('../../../../../../lib/middleware/messages/member/macro-reply');

const mockConversation = conversationFactory.getValidConversation();
// const mockError = { status: 500, message: 'Epic fail' };
const mockMacro = 'subscriptionStatusStop';

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = mockConversation;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('replyMacro calls next if macro does not have a reply', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  sandbox.stub(helpers.macro, 'getReply')
    .returns(null);

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.have.been.called;
});

test('replyMacro calls reply helper if macro has reply and request is not a topic change', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  t.context.req.macro = mockMacro;
  sandbox.stub(helpers.macro, 'getReply')
    .returns(mockMacro);
  sandbox.stub(helpers.request, 'isTopicChange')
    .returns(false);
  sandbox.stub(helpers.replies, mockMacro)
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.getReply.should.have.been.calledWith(t.context.req.macro);
  helpers.replies[mockMacro].should.have.been.calledWith(t.context.req, t.context.res);
  next.should.not.have.been.called;
});

test('replyMacro sets conversation topic if macro has reply and request is a topic change', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  t.context.req.macro = mockMacro;
  const mockTopic = stubs.getRandomWord();
  t.context.req.rivescriptReplyTopic = mockTopic;
  sandbox.stub(helpers.macro, 'getReply')
    .returns(mockMacro);
  sandbox.stub(helpers.request, 'isTopicChange')
    .returns(true);
  sandbox.stub(helpers.replies, mockMacro)
    .returns(underscore.noop);
  sandbox.stub(mockConversation, 'setTopic')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.getReply.should.have.been.calledWith(t.context.req.macro);
  helpers.replies[mockMacro].should.have.been.calledWith(t.context.req, t.context.res);
  mockConversation.setTopic.should.have.been.calledWith(mockTopic);
  next.should.not.have.been.called;
});

test('replyMacro calls sendErrorResponse if setTopic fails', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  t.context.req.macro = mockMacro;
  const mockTopic = stubs.getRandomWord();
  t.context.req.rivescriptReplyTopic = mockTopic;
  sandbox.stub(helpers.macro, 'getReply')
    .returns(mockMacro);
  sandbox.stub(helpers.request, 'isTopicChange')
    .returns(true);
  sandbox.stub(helpers.replies, mockMacro)
    .returns(underscore.noop);
  const mockError = { message: 'Epic fail' };
  sandbox.stub(mockConversation, 'setTopic')
    .returns(Promise.reject(mockError));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.getReply.should.have.been.calledWith(t.context.req.macro);
  helpers.replies[mockMacro].should.not.have.been.called;
  mockConversation.setTopic.should.have.been.calledWith(mockTopic);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, mockError);
});
