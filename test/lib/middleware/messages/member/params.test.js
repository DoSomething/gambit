'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../lib/helpers');
const stubs = require('../../../../helpers/stubs');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const paramsMiddleware = require('../../../../../lib/middleware/messages/member/params');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

const stubParseTwilioBody = () => Promise.resolve(true);
const stubOrigins = {
  twilio: 'twilio',
  custom: 'custom',
};
const userId = stubs.getUserId();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);

  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('paramsMiddleware should call sendErrorResponse if query.origin not found', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = paramsMiddleware();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('params should call twilio helper.parseBody if Twilio message', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = paramsMiddleware();
  t.context.req.query.origin = stubOrigins.twilio;
  sandbox.stub(helpers.twilio, 'parseBody')
    .callsFake(stubParseTwilioBody);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.twilio.parseBody.should.have.been.called;
  next.should.have.been.called;
});

test('param should sendErrorResponse if northstarId not found in custom message', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = paramsMiddleware();
  t.context.req.query.origin = stubOrigins.custom;

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('paramsMiddleware should call next if custom message has required params', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = paramsMiddleware();
  t.context.req.query.origin = stubOrigins.custom;
  t.context.req.body = {
    northstarId: userId,
  };
  sandbox.stub(helpers.attachments, 'parseFromReq')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.attachments.parseFromReq.should.have.been.called;
  next.should.have.been.called;
});
