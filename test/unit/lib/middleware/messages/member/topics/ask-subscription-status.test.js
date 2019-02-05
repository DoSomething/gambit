'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../../lib/helpers');
const stubs = require('../../../../../../helpers/stubs');
const topicFactory = require('../../../../../../helpers/factories/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const askSubscriptionStatusCatchAll = require('../../../../../../../lib/middleware/messages/member/topics/ask-subscription-status');
// stubs
const askSubscriptionStatus = topicFactory.getValidAskSubscriptionStatusBroadcastTopic();
const error = { message: 'Epic fail' };

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.resolve(true));
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('askSubscriptionStatusCatchAll should call next if req.topic is not an askSubscriptionStatus', async (t) => {
  const next = sinon.stub();
  const middleware = askSubscriptionStatusCatchAll();
  t.context.req.topic = topicFactory.getValidAutoReply();

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
});

test('askSubscriptionStatusCatchAll should call sendErrorResponse if parseAskSubscriptionStatusResponse fails', async (t) => {
  const next = sinon.stub();
  const middleware = askSubscriptionStatusCatchAll();
  sandbox.stub(helpers.request, 'parseAskSubscriptionStatusResponse')
    .returns(Promise.reject(error));
  t.context.req.topic = askSubscriptionStatus;

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});

test('askSubscriptionStatusCatchAll should change topic to saidActiveTopic and send saidActive reply if request is subscriptionStatusActive macro', async (t) => {
  const next = sinon.stub();
  const macro = helpers.macro.macros.subscriptionStatusActive();
  const middleware = askSubscriptionStatusCatchAll();
  t.context.req.macro = macro;
  t.context.req.topic = askSubscriptionStatus;
  sandbox.stub(helpers.request, 'parseAskSubscriptionStatusResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.executeInboundTopicChange
    .should.have.been.calledWith(t.context.req, askSubscriptionStatus.saidActiveTopic);
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    askSubscriptionStatus.saidActive,
    macro,
  );
});

test('askSubscriptionStatusCatchAll should change topic to saidLessTopic and send saidLess reply if request is subscriptionStatusLess macro', async (t) => {
  const next = sinon.stub();
  const macro = helpers.macro.macros.subscriptionStatusLess();
  const middleware = askSubscriptionStatusCatchAll();
  t.context.req.macro = macro;
  t.context.req.topic = askSubscriptionStatus;
  sandbox.stub(helpers.request, 'parseAskSubscriptionStatusResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.executeInboundTopicChange
    .should.have.been.calledWith(t.context.req, askSubscriptionStatus.saidLessTopic);
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    askSubscriptionStatus.saidLess,
    macro,
  );
});

test('askSubscriptionStatusCatchAll should change topic to unsubscribed and send macro reply if request is subscriptionStatusStop macro', async (t) => {
  const next = sinon.stub();
  const macro = helpers.macro.macros.subscriptionStatusStop();
  const middleware = askSubscriptionStatusCatchAll();
  t.context.req.macro = macro;
  t.context.req.topic = askSubscriptionStatus;
  sandbox.stub(helpers.request, 'parseAskSubscriptionStatusResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.executeInboundTopicChange
    .should.have.been.calledWith(t.context.req, helpers.topic.getUnsubscribedTopic());
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    helpers.macro.getMacro(macro).text,
    macro,
  );
});


test('askSubscriptionStatusCatchAll should not change topic and send saidNeedMoreInfo reply if request is subscriptionStatusNeedMoreInfo macro', async (t) => {
  const next = sinon.stub();
  const macro = helpers.macro.macros.subscriptionStatusNeedMoreInfo();
  const middleware = askSubscriptionStatusCatchAll();
  t.context.req.macro = macro;
  t.context.req.topic = askSubscriptionStatus;
  sandbox.stub(helpers.request, 'parseAskSubscriptionStatusResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.executeInboundTopicChange.should.not.have.been.called;
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    askSubscriptionStatus.saidNeedMoreInfo,
    macro,
  );
});

test('askSubscriptionStatusCatchAll should not change topic, sends invalidAskSubscriptionStatusResponse if not a subscription status macro', async (t) => {
  const next = sinon.stub();
  const macro = stubs.getRandomWord();
  const middleware = askSubscriptionStatusCatchAll();
  t.context.req.macro = macro;
  t.context.req.topic = askSubscriptionStatus;
  sandbox.stub(helpers.request, 'parseAskSubscriptionStatusResponse')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.changeTopic.should.not.have.been.called;
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    askSubscriptionStatus.invalidAskSubscriptionStatusResponse,
    macro,
  );
});
