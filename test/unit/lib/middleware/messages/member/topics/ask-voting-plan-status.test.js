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
const askVotingPlanStatusCatchAll = require('../../../../../../../lib/middleware/messages/member/topics/ask-voting-plan-status');
// stubs
const askVotingPlanStatus = topicFactory.getValidAskVotingPlanStatusBroadcastTopic();
const messageText = stubs.getRandomMessageText();
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

test('askVotingPlanStatusCatchAll should call next if req.topic is not an askVotingPlanStatus', async (t) => {
  const next = sinon.stub();
  const middleware = askVotingPlanStatusCatchAll();
  t.context.req.topic = topicFactory.getValidAutoReply();

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
});

test('askVotingPlanStatusCatchAll should call sendErrorResponse if parseAskVotingPlanStatusResponse fails', async (t) => {
  const next = sinon.stub();
  const middleware = askVotingPlanStatusCatchAll();
  sandbox.stub(helpers.request, 'parseAskVotingPlanStatusResponse')
    .returns(Promise.reject(error));
  t.context.req.topic = askVotingPlanStatus;

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});

test('askVotingPlanStatusCatchAll should not call changeTopic, sends invalidAskVotingPlanStatusResponse macro reply if request is not a votingPlanStatus macro', async (t) => {
  const next = sinon.stub();
  const middleware = askVotingPlanStatusCatchAll();
  sandbox.stub(helpers.request, 'parseAskVotingPlanStatusResponse')
    .returns(Promise.resolve(true));
  t.context.req.topic = askVotingPlanStatus;
  t.context.req.macro = helpers.macro.macros.invalidAskVotingPlanStatusResponse();

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.changeTopic.should.not.have.been.called;
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    helpers.macro.getMacro(t.context.req.macro).text,
    t.context.req.macro,
  );
});

test('askVotingPlanStatusCatchAll should change topic to macro topic and send macro text if status is voting', async (t) => {
  const next = sinon.stub();
  const macro = 'votingPlanStatusVoting';
  const middleware = askVotingPlanStatusCatchAll();
  const topic = topicFactory.getValidAutoReply();
  sandbox.stub(helpers.request, 'parseAskVotingPlanStatusResponse')
    .returns(Promise.resolve(true));
  sandbox.stub(helpers.macro, 'isVotingPlanStatusVoting')
    .returns(true);
  sandbox.stub(helpers.macro, 'getMacro')
    .returns({ text: messageText, topic });
  t.context.req.topic = askVotingPlanStatus;
  t.context.req.macro = macro;

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.changeTopic.should.have.been.calledWith(t.context.req, topic);
  helpers.replies.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, messageText, macro);
});

test('askVotingPlanStatusCatchAll should change topic to saidVotedTopic and send saidVoted reply if macro is votingPlanStatusVoted', async (t) => {
  const next = sinon.stub();
  const macro = helpers.macro.macros.votingPlanStatusVoted();
  const middleware = askVotingPlanStatusCatchAll();
  sandbox.stub(helpers.request, 'parseAskVotingPlanStatusResponse')
    .returns(Promise.resolve(true));
  t.context.req.topic = askVotingPlanStatus;
  t.context.req.macro = macro;

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.changeTopic
    .should.have.been.calledWith(t.context.req, askVotingPlanStatus.saidVotedTopic);
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    askVotingPlanStatus.saidActive,
    macro,
  );
});

test('askVotingPlanStatusCatchAll should change topic to cantVoteTopic and send cantVote reply if macro is votingPlanStatusCantVote', async (t) => {
  const next = sinon.stub();
  const macro = helpers.macro.macros.votingPlanStatusCantVote();
  const middleware = askVotingPlanStatusCatchAll();
  sandbox.stub(helpers.request, 'parseAskVotingPlanStatusResponse')
    .returns(Promise.resolve(true));
  t.context.req.topic = askVotingPlanStatus;
  t.context.req.macro = macro;

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.changeTopic
    .should.have.been.calledWith(t.context.req, askVotingPlanStatus.saidCantVoteTopic);
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    askVotingPlanStatus.saidCantVote,
    macro,
  );
});

test('askVotingPlanStatusCatchAll should change topic to notVotingTopic and send notVoting reply if macro is votingPlanStatusNotVoting', async (t) => {
  const next = sinon.stub();
  const macro = helpers.macro.macros.votingPlanStatusNotVoting();
  const middleware = askVotingPlanStatusCatchAll();
  sandbox.stub(helpers.request, 'parseAskVotingPlanStatusResponse')
    .returns(Promise.resolve(true));
  t.context.req.topic = askVotingPlanStatus;
  t.context.req.macro = macro;

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.request.changeTopic
    .should.have.been.calledWith(t.context.req, askVotingPlanStatus.saidNotVotingTopic);
  helpers.replies.sendReply.should.have.been.calledWith(
    t.context.req,
    t.context.res,
    askVotingPlanStatus.saidNotVoting,
    macro,
  );
});
