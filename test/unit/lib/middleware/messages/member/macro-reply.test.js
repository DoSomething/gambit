'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');

const macroHelper = helpers.macro;
const replies = helpers.replies;

chai.should();
chai.use(sinonChai);

// module to be tested
const replyMacro = require('../../../../../../lib/middleware/messages/member/macro-reply');

const sandbox = sinon.sandbox.create();

const macroName = 'subscriptionStatusStop';

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.macro = 'trialByCombat';
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('replyMacro should call replies[macroReply] if macro.getReply returns string', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = replyMacro();
  sandbox.stub(macroHelper, 'getReply')
    .returns(macroName);
  sandbox.stub(replies, 'subscriptionStatusStop')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  replies.subscriptionStatusStop.should.have.been.called;
  next.should.not.have.been.called;
});

test('replyMacro should call next if macro.getReply undefined', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = replyMacro();
  sandbox.stub(macroHelper, 'getReply')
    .returns(null);
  sandbox.stub(replies, 'subscriptionStatusStop')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  replies.subscriptionStatusStop.should.not.have.been.called;
  next.should.have.been.called;
});

test('replyMacro should call sendErrorResponse if macro.getReply throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = replyMacro();
  sandbox.stub(macroHelper, 'getReply')
    .throws();
  sandbox.stub(replies, 'subscriptionStatusStop')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.called;
  replies.subscriptionStatusStop.should.not.have.been.called;
  next.should.not.have.been.called;
});

test('replyMacro should call sendErrorResponse if replies throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = replyMacro();
  sandbox.stub(macroHelper, 'getReply')
    .returns(true);
  sandbox.stub(replies, 'subscriptionStatusStop')
    .throws();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});
