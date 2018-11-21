'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../../lib/helpers');
const logger = require('../../../../../../../lib/logger');
const broadcastFactory = require('../../../../../../helpers/factories/broadcast');
const topicFactory = require('../../../../../../helpers/factories/topic');
const userFactory = require('../../../../../../helpers/factories/user');

chai.should();
chai.use(sinonChai);

// module to be tested
const askYesNoCatchAll = require('../../../../../../../lib/middleware/messages/member/topics/ask-yes-no');

// stubs
const askYesNoBroadcast = broadcastFactory.getValidAskYesNo();
const error = { message: 'Epic fail' };

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(logger, 'debug')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'invalidAskYesNoResponse')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'saidNo')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'saidYes')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  t.context.req.user = userFactory.getValidUser();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('askYesNoCatchAll should call next if req.topic is not an askYesNo', async (t) => {
  const next = sinon.stub();
  const middleware = askYesNoCatchAll();
  sandbox.stub(helpers.topic, 'isAskYesNo')
    .returns(false);
  t.context.req.topic = topicFactory.getValidAutoReply();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isAskYesNo.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.saidYes.should.not.have.been.called;
  helpers.replies.saidNo.should.not.have.been.called;
  helpers.replies.invalidAskYesNoResponse.should.not.have.been.called;
});

test('askYesNoCatchAll should call sendErrorResponse if askYesNo and request.parseAskYesNoResponse fails', async (t) => {
  const next = sinon.stub();
  const middleware = askYesNoCatchAll();
  t.context.req.topic = askYesNoBroadcast;
  sandbox.stub(helpers.request, 'parseAskYesNoResponse')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.parseAskYesNoResponse.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.saidYes.should.not.have.been.called;
  helpers.replies.saidNo.should.not.have.been.called;
  helpers.replies.invalidAskYesNoResponse.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});

test('askYesNoCatchAll should executeInboundTopicChange and send saidYes reply if askYesNo and request isSaidYesMacro', async (t) => {
  const next = sinon.stub();
  const middleware = askYesNoCatchAll();
  t.context.req.topic = askYesNoBroadcast;
  const saidYesTemplate = askYesNoBroadcast.templates.saidYes;
  sandbox.stub(helpers.request, 'parseAskYesNoResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'isSaidYesMacro')
    .returns(true);
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.parseAskYesNoResponse.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  const details = `broadcast/${askYesNoBroadcast.id}`;
  helpers.request.executeInboundTopicChange
    .should.have.been.calledWith(t.context.req, saidYesTemplate.topic, details);
  helpers.replies.saidYes
    .should.have.been.calledWith(t.context.req, t.context.res, saidYesTemplate.text);
  helpers.sendErrorResponse.should.not.been.called;
});

test('askYesNoCatchAll should call sendErrorResponse if request isSaidYesMacro but executeInboundTopicChange fails', async (t) => {
  const next = sinon.stub();
  const middleware = askYesNoCatchAll();
  t.context.req.topic = askYesNoBroadcast;
  sandbox.stub(helpers.request, 'parseAskYesNoResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'isSaidYesMacro')
    .returns(true);
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .throws();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.parseAskYesNoResponse.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.saidYes.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('askYesNoCatchAll should call sendErrorResponse if request isSaidYesMacro but saidYesTopic id undefined', async (t) => {
  const next = sinon.stub();
  const middleware = askYesNoCatchAll();
  t.context.req.topic = askYesNoBroadcast;
  t.context.req.topic.templates.saidYes.topic = null;
  sandbox.stub(helpers.request, 'parseAskYesNoResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'isSaidYesMacro')
    .returns(true);
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .throws();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.parseAskYesNoResponse.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.saidYes.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('askYesNoCatchAll should execute executeInboundTopicChange and send saidNo reply if askYesNo and request isSaidNoMacro', async (t) => {
  const next = sinon.stub();
  const middleware = askYesNoCatchAll();
  t.context.req.topic = askYesNoBroadcast;
  sandbox.stub(helpers.request, 'parseAskYesNoResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'isSaidYesMacro')
    .returns(false);
  sandbox.stub(helpers.request, 'isSaidNoMacro')
    .returns(true);
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.parseAskYesNoResponse.should.have.been.calledWith(t.context.req);
  const details = `broadcast/${askYesNoBroadcast.id}`;
  helpers.request.executeInboundTopicChange
    .should.have.been.calledWith(t.context.req, askYesNoBroadcast.templates.saidNo.topic, details);
  helpers.sendErrorResponse.should.not.been.called;
});

test('askYesNoCatchAll should call sendErrorResponse if request isSaidNoMacro but executeSaidNoMacro fails', async (t) => {
  const next = sinon.stub();
  const middleware = askYesNoCatchAll();
  t.context.req.topic = askYesNoBroadcast;
  sandbox.stub(helpers.request, 'parseAskYesNoResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'isSaidYesMacro')
    .returns(false);
  sandbox.stub(helpers.request, 'isSaidNoMacro')
    .returns(true);
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .throws();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.parseAskYesNoResponse.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.saidNo.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('askYesNoCatchAll should call sendErrorResponse if request isSaidNoMacro but saidNoTopic id undefined', async (t) => {
  const next = sinon.stub();
  const middleware = askYesNoCatchAll();
  t.context.req.topic = askYesNoBroadcast;
  t.context.req.topic.templates.saidNo.topic = null;
  sandbox.stub(helpers.request, 'parseAskYesNoResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'isSaidYesMacro')
    .returns(false);
  sandbox.stub(helpers.request, 'isSaidNoMacro')
    .returns(true);
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .throws();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.parseAskYesNoResponse.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.saidNo.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('askYesNoCatchAll should not changeTopic and send invalidAskYesNoResponse template if askYesNo and request is neither saidYes or saidNo macro', async (t) => {
  const next = sinon.stub();
  const middleware = askYesNoCatchAll();
  t.context.req.topic = askYesNoBroadcast;
  sandbox.stub(helpers.request, 'parseAskYesNoResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'isSaidYesMacro')
    .returns(false);
  sandbox.stub(helpers.request, 'isSaidNoMacro')
    .returns(false);
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.parseAskYesNoResponse.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.request.executeInboundTopicChange.should.not.have.been.called;
  helpers.replies.invalidAskYesNoResponse.should.have.been.called;
  helpers.sendErrorResponse.should.not.been.called;
});
