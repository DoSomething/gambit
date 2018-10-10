'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const broadcastFactory = require('../../../../../helpers/factories/broadcast');
const topicFactory = require('../../../../../helpers/factories/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const askVotingPlanStatusCatchAll = require('../../../../../../lib/middleware/messages/member/catchAll-askVotingPlanStatus');

// stubs
const askVotingPlanStatus = broadcastFactory.getValidAskVotingPlanStatus();
const error = { message: 'Epic fail' };

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.replies, 'sendReply')
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

test('askVotingPlanStatusCatchAll should call next if req.topic is not an askVotingPlanStatus', async (t) => {
  const next = sinon.stub();
  const middleware = askVotingPlanStatusCatchAll();
  sandbox.stub(helpers.topic, 'isAskVotingPlanStatus')
    .returns(false);
  t.context.req.topic = topicFactory.getValidAutoReply();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isAskVotingPlanStatus.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
});

test('askVotingPlanStatusCatchAll should call sendErrorResponse if parseAskVotingPlanStatusResponse fails', async (t) => {
  const next = sinon.stub();
  const middleware = askVotingPlanStatusCatchAll();
  sandbox.stub(helpers.topic, 'isAskVotingPlanStatus')
    .returns(true);
  sandbox.stub(helpers.request, 'parseAskVotingPlanStatusResponse')
    .returns(Promise.reject(error));
  t.context.req.topic = askVotingPlanStatus;

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isAskVotingPlanStatus.should.have.been.calledWith(t.context.req.topic);
  next.should.not.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});

