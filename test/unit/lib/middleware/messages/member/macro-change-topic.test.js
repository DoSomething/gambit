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

chai.should();
chai.use(sinonChai);

// module to be tested
const changeTopicMacro = require('../../../../../../lib/middleware/messages/member/macro-change-topic');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.replies, 'noCampaign')
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

test('changeTopicMacro returns next if req.macro undefined', async (t) => {
  const next = sinon.stub();
  const middleware = changeTopicMacro();
  sandbox.stub(helpers.macro, 'isChangeTopic')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.isChangeTopic.should.not.have.been.called;
  next.should.have.been.called;
  helpers.replies.noCampaign.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('changeTopicMacro returns next if not macro.isChangeTopic', async (t) => {
  const next = sinon.stub();
  const middleware = changeTopicMacro();
  t.context.req.macro = stubs.getRandomWord();
  sandbox.stub(helpers.macro, 'isChangeTopic')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.isChangeTopic.should.have.been.called;
  next.should.have.been.called;
  helpers.replies.noCampaign.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('changeTopicMacro returns noCampaign reply if macro.isChangeTopic', async (t) => {
  const next = sinon.stub();
  const middleware = changeTopicMacro();
  t.context.req.macro = stubs.getRandomWord();
  sandbox.stub(helpers.macro, 'isChangeTopic')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.isChangeTopic.should.have.been.called;
  next.should.not.have.been.called;
  helpers.replies.noCampaign.should.have.been.calledWith(t.context.req, t.context.res);
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('changeTopicMacro should call sendErrorResponse if postMessageToSupport fails', async (t) => {
  const next = sinon.stub();
  const middleware = changeTopicMacro();
  const error = new Error('epic fail');
  t.context.req.macro = stubs.getRandomWord();
  sandbox.stub(helpers.macro, 'isChangeTopic')
    .throws(error);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.macro.isChangeTopic.should.have.been.called;
  next.should.not.have.been.called;
  helpers.replies.noCampaign.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
