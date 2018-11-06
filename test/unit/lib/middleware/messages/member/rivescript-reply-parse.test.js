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

const error = stubs.getError();
const replyText = stubs.getRandomMessageText();

chai.should();
chai.use(sinonChai);

// module to be tested
const parseRivescriptReply = require('../../../../../../lib/middleware/messages/member/rivescript-reply-parse');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.rivescriptReplyText = replyText;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('parseRivescriptReply calls next if req.macro is set', async (t) => {
  const next = sinon.stub();
  const middleware = parseRivescriptReply();
  sandbox.stub(helpers.request, 'executeRivescriptTopicChange')
    .returns(Promise.resolve(underscore.noop));
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(Promise.resolve(underscore.noop));
  t.context.req.macro = stubs.getMacro();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.executeRivescriptTopicChange.should.not.have.been.called;
  next.should.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('parseRivescriptReply calls executeRivescriptTopicChange and sends changeTopic template if req.rivescriptReplyTopicId is set', async (t) => {
  const next = sinon.stub();
  const middleware = parseRivescriptReply();
  sandbox.stub(helpers.request, 'executeRivescriptTopicChange')
    .returns(Promise.resolve(underscore.noop));
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(Promise.resolve(underscore.noop));
  t.context.req.rivescriptReplyTopicId = stubs.getContentfulId();
  t.context.req.rivescriptReplyText = replyText;

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.executeRivescriptTopicChange.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, replyText, 'changeTopic');
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('parseRivescriptReply does not call executeRivescriptTopicChange and sends quickReply template if req.rivescriptReplyTopicId undefined', async (t) => {
  const next = sinon.stub();
  const middleware = parseRivescriptReply();
  sandbox.stub(helpers.request, 'executeRivescriptTopicChange')
    .returns(Promise.resolve(underscore.noop));
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(Promise.resolve(underscore.noop));
  t.context.req.rivescriptReplyTopicId = null;
  t.context.req.rivescriptReplyText = replyText;

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.executeRivescriptTopicChange.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.replies.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, replyText, 'quickReply');
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('parseRivescriptReply calls sendErrorResponse if req.rivescriptReplyTopicId is set and executeRivescriptTopicChange fails', async (t) => {
  const next = sinon.stub();
  const middleware = parseRivescriptReply();
  sandbox.stub(helpers.request, 'executeRivescriptTopicChange')
    .returns(Promise.reject(error));
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(Promise.resolve(underscore.noop));
  t.context.req.rivescriptReplyTopicId = stubs.getContentfulId();
  t.context.req.rivescriptReplyText = replyText;

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.executeRivescriptTopicChange.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});

test('parseRivescriptReply calls sendErrorResponse if sendReply fails', async (t) => {
  const next = sinon.stub();
  const middleware = parseRivescriptReply();
  t.context.req.rivescriptReplyTopicId = null;
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.replies.sendReply.should.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
