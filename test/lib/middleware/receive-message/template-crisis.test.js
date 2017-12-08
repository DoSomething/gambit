'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../lib/helpers');

const macroHelper = helpers.macro;
const replies = helpers.replies;

chai.should();
chai.use(sinonChai);

// module to be tested
const crisisTemplate = require('../../../../lib/middleware/receive-message/template-crisis');

const sandbox = sinon.sandbox.create();

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

test('crisisTemplate should call replies.crisisMessage if macro.isSendCrisisMessage is true', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = crisisTemplate();
  sandbox.stub(macroHelper, 'isSendCrisisMessage')
    .returns(true);
  sandbox.stub(replies, 'crisisMessage')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  replies.crisisMessage.should.have.been.called;
  next.should.not.have.been.called;
});

test('crisisTemplate should call next if macro.isSendCrisisMessage is false', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = crisisTemplate();
  sandbox.stub(macroHelper, 'isSendCrisisMessage')
    .returns(false);
  sandbox.stub(replies, 'crisisMessage')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  replies.crisisMessage.should.not.have.been.called;
  next.should.have.been.called;
});

test('crisisTemplate should call sendErrorResponse if macro.isSendCrisisMessage throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = crisisTemplate();
  sandbox.stub(macroHelper, 'isSendCrisisMessage')
    .throws();
  sandbox.stub(replies, 'crisisMessage')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.called;
  replies.crisisMessage.should.not.have.been.called;
  next.should.not.have.been.called;
});

test('crisisTemplate should call sendErrorResponse if replies.crisisMessage throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = crisisTemplate();
  sandbox.stub(macroHelper, 'isSendCrisisMessage')
    .returns(true);
  sandbox.stub(replies, 'crisisMessage')
    .throws();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});
