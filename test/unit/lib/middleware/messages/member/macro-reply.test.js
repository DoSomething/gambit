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
const mockTopic = { id: stubs.getRandomWord() };
const mockMacroWithTopic = {
  name: stubs.getRandomWord(),
  text: stubs.getRandomMessageText(),
  topic: mockTopic,
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

test('replyMacro calls next if macro text is not defined', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  sandbox.stub(helpers.macro, 'getMacro')
    .returns({ name: stubs.getRandomWord() });

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.have.been.called;
});

test('replyMacro sends reply if macro text is set', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  sandbox.stub(helpers.macro, 'getMacro')
    .returns(mockMacro);
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.resolve());
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(underscore.noop);
  t.context.req.macro = mockMacro.name;

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.getMacro.should.have.been.calledWith(t.context.req.macro);
  helpers.request.changeTopic.should.not.have.been.called;
  helpers.replies.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, mockMacro.text, mockMacro.name);
});

test('replyMacro calls helpers.request.changeTopic if macro topic is set', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  t.context.req.macro = mockMacro.name;
  sandbox.stub(helpers.macro, 'getMacro')
    .returns(mockMacroWithTopic);
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.getMacro.should.have.been.calledWith(t.context.req.macro);
  helpers.replies.sendReply.should.have.been
    .calledWith(t.context.req, t.context.res, mockMacroWithTopic.text, mockMacroWithTopic.name);
  helpers.request.changeTopic.should.have.been.calledWith(t.context.req, mockTopic);
  next.should.not.have.been.called;
});

test('replyMacro calls sendErrorResponse if changeTopic fails', async (t) => {
  const next = sinon.stub();
  const middleware = replyMacro();
  t.context.req.macro = mockMacro;
  sandbox.stub(helpers.macro, 'getMacro')
    .returns(mockMacroWithTopic);
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(underscore.noop);
  const mockError = { message: 'Epic fail' };
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.reject(mockError));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.getMacro.should.have.been.calledWith(t.context.req.macro);
  helpers.replies.sendReply.should.not.have.been.called;
  helpers.request.changeTopic.should.have.been.calledWith(t.context.req, mockTopic);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, mockError);
});
