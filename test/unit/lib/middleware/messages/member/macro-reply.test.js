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
const mockMacro = {
  name: 'subscriptionStatusStop',
  text: stubs.getRandomMessageText(),
};

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

test('replyMacro calls next if macro does not have reply text defined', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  sandbox.stub(helpers.macro, 'getReplyText')
    .returns(null);

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.have.been.called;
});

test('replyMacro calls helpers.request.changeTopic and sends reply if macro has reply text', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  t.context.req.macro = mockMacro.name;
  const mockTopic = stubs.getRandomWord();
  t.context.req.rivescriptReplyTopic = mockTopic;
  sandbox.stub(helpers.macro, 'getReplyText')
    .returns(mockMacro.text);
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.getReplyText.should.have.been.calledWith(t.context.req.macro);
  helpers.replies.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, mockMacro.text, mockMacro.name);
  helpers.request.changeTopic.should.have.been.calledWith(t.context.req, mockTopic);
  next.should.not.have.been.called;
});

test('replyMacro calls sendErrorResponse if changeTopic fails', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  t.context.req.macro = mockMacro;
  const mockTopic = stubs.getRandomWord();
  t.context.req.rivescriptReplyTopic = mockTopic;
  sandbox.stub(helpers.macro, 'getReplyText')
    .returns(mockMacro.text);
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(underscore.noop);
  const mockError = { message: 'Epic fail' };
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.reject(mockError));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.getReplyText.should.have.been.calledWith(t.context.req.macro);
  helpers.replies.sendReply.should.not.have.been.called;
  helpers.request.changeTopic.should.have.been.calledWith(t.context.req, mockTopic);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, mockError);
});
