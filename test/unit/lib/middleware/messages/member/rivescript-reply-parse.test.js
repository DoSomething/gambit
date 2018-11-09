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
const topicFactory = require('../../../../../helpers/factories/topic');

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
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve(underscore.noop));
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(Promise.resolve(underscore.noop));
  t.context.req.macro = stubs.getMacro();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.executeInboundTopicChange.should.not.have.been.called;
  next.should.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('parseRivescriptReply calls executeInboundTopicChange and sends changeTopic template if req.rivescriptReplyTopicId is set', async (t) => {
  const next = sinon.stub();
  const middleware = parseRivescriptReply();
  const keyword = stubs.getRandomWord();
  const topic = topicFactory.getValidTextPostConfig();
  const template = stubs.getRandomWord();
  sandbox.stub(helpers.topic, 'getById')
    .returns(Promise.resolve(topic));
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve(underscore.noop));
  sandbox.stub(helpers.topic, 'getTransitionTemplateName')
    .returns(template);
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(Promise.resolve(underscore.noop));
  t.context.req.rivescriptReplyTopicId = stubs.getContentfulId();
  t.context.req.rivescriptReplyText = replyText;
  t.context.req.rivescriptMatch = keyword;

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.getById.should.have.been.calledWith(t.context.req.rivescriptReplyTopicId);
  helpers.request.executeInboundTopicChange
    .should.have.been.calledWith(t.context.req, topic, `keyword/${keyword}`);
  next.should.not.have.been.called;
  helpers.replies.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, replyText, template);
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('parseRivescriptReply does not call executeInboundTopicChange and sends quickReply template if req.rivescriptReplyTopicId undefined', async (t) => {
  const next = sinon.stub();
  const middleware = parseRivescriptReply();
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve(underscore.noop));
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(Promise.resolve(underscore.noop));
  t.context.req.rivescriptReplyTopicId = null;
  t.context.req.rivescriptReplyText = replyText;

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.executeInboundTopicChange.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.replies.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, replyText, 'quickReply');
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('parseRivescriptReply calls sendErrorResponse if req.rivescriptReplyTopicId is set and executeInboundTopicChange fails', async (t) => {
  const next = sinon.stub();
  const middleware = parseRivescriptReply();
  sandbox.stub(helpers.topic, 'getById')
    .returns(Promise.resolve(underscore.noop));
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.reject(error));
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(Promise.resolve(underscore.noop));
  t.context.req.rivescriptReplyTopicId = stubs.getContentfulId();
  t.context.req.rivescriptReplyText = replyText;

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.topic.getById.should.have.been.called;
  helpers.request.executeInboundTopicChange.should.have.been.called;
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
