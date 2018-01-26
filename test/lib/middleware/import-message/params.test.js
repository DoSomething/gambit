'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../lib/helpers');
const stubs = require('../../../helpers/stubs');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const paramsMiddleware = require('../../../../lib/middleware/import-message/params');

// sinon sandbox object
const sandbox = sinon.sandbox.create();
const broadcastId = stubs.getBroadcastId();

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

test('paramsMiddleware calls sendErrorResponse if isTwilioStatusCallback is false', async (t) => {
  // setup
  const next = sinon.stub();
  sandbox.stub(helpers.request, 'isTwilioStatusCallback')
    .returns(false);
  const middleware = paramsMiddleware();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.isTwilioStatusCallback.should.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('paramsMiddleware should call sendErrorResponse if query.broadcastId not found', async (t) => {
  // setup
  const next = sinon.stub();
  sandbox.stub(helpers.request, 'isTwilioStatusCallback')
    .returns(true);
  const middleware = paramsMiddleware();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.isTwilioStatusCallback.should.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('paramsMiddleware should call next if query.broadcastId found', async (t) => {
  // setup
  const next = sinon.stub();
  sandbox.stub(helpers.request, 'isTwilioStatusCallback')
    .returns(true);
  const middleware = paramsMiddleware();
  t.context.req.query = {
    broadcastId,
  };

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.isTwilioStatusCallback.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
  t.context.req.broadcastId.should.equal(broadcastId);
  next.should.have.been.called;
});
