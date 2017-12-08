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
const infoTemplate = require('../../../../lib/middleware/receive-message/template-info');

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

test('infoTemplate should call replies.infoMessage if macro.isSendInfoMessage is true', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = infoTemplate();
  sandbox.stub(macroHelper, 'isSendInfoMessage')
    .returns(true);
  sandbox.stub(replies, 'infoMessage')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  replies.infoMessage.should.have.been.called;
  next.should.not.have.been.called;
});

test('infoTemplate should call next if macro.isSendInfoMessage is false', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = infoTemplate();
  sandbox.stub(macroHelper, 'isSendInfoMessage')
    .returns(false);
  sandbox.stub(replies, 'infoMessage')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  replies.infoMessage.should.not.have.been.called;
  next.should.have.been.called;
});

test('infoTemplate should call sendErrorResponse if macro.isSendInfoMessage throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = infoTemplate();
  sandbox.stub(macroHelper, 'isSendInfoMessage')
    .throws();
  sandbox.stub(replies, 'infoMessage')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.called;
  replies.infoMessage.should.not.have.been.called;
  next.should.not.have.been.called;
});

test('infoTemplate should call sendErrorResponse if replies.infoMessage throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = infoTemplate();
  sandbox.stub(macroHelper, 'isSendInfoMessage')
    .returns(true);
  sandbox.stub(replies, 'infoMessage')
    .throws();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});
