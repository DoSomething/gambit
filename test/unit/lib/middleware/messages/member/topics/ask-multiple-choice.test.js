'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../../lib/helpers');
const topicFactory = require('../../../../../../helpers/factories/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const askMultipleChoiceCatchAll = require('../../../../../../../lib/middleware/messages/member/topics/ask-multiple-choice');
// stubs
const askMultipleChoice = topicFactory.getValidAskMultipleChoiceBroadcastTopic();
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

test('askMultipleChoiceCatchAll should call next if req.topic is not an askMultipleChoice', async (t) => {
  const next = sinon.stub();
  const middleware = askMultipleChoiceCatchAll();
  t.context.req.topic = topicFactory.getValidAutoReply();

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
});

test('askMultipleChoiceCatchAll should call sendErrorResponse if parseAskMultipleChoiceResponse fails', async (t) => {
  const next = sinon.stub();
  const middleware = askMultipleChoiceCatchAll();
  sandbox.stub(helpers.request, 'parseAskMultipleChoiceResponse')
    .returns(Promise.reject(error));
  t.context.req.topic = askMultipleChoice;

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});

test('askMultipleChoiceCatchAll should change topic to saidFirstChoiceTopic and send saidFirstChoice reply if request is parsed as saidFirstChoice macro', async (t) => {
  const next = sinon.stub();
  const macro = helpers.macro.macros.saidFirstChoice();
  const middleware = askMultipleChoiceCatchAll();
  t.context.req.macro = macro;
  t.context.req.topic = askMultipleChoice;
  sandbox.stub(helpers.request, 'parseAskMultipleChoiceResponse')
    .returns(Promise.resolve());
  sandbox.stub(helpers.request, 'executeInboundTopicChange')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.executeInboundTopicChange
    .should.have.been.calledWith(t.context.req, askMultipleChoice.saidFirstChoiceTopic);
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    askMultipleChoice.saidFirstChoice,
    macro,
  );
});

test('askMultipleChoiceCatchAll should not change topic, sends invalidAskMultipleChoiceResponse if not a subscription status macro', async (t) => {
  const next = sinon.stub();
  const macro = helpers.macro.macros.invalidAskMultipleChoiceResponse();
  const middleware = askMultipleChoiceCatchAll();
  t.context.req.macro = macro;
  t.context.req.topic = askMultipleChoice;
  sandbox.stub(helpers.request, 'parseAskMultipleChoiceResponse')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.changeTopic.should.not.have.been.called;
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    askMultipleChoice.invalidAskMultipleChoiceResponse,
    macro,
  );
});
