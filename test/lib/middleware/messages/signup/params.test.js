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
const paramsMiddleware = require('../../../../../lib/middleware/messages/signup/params');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

const userId = stubs.getUserId();
const campaignId = stubs.getCampaignId();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);

  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.req.body = {};
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('paramsMiddleware should call sendErrorResponse if body.northstarId not found', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = paramsMiddleware();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('paramsMiddleware should call sendErrorResponse if body.campaignId not found', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = paramsMiddleware();
  t.context.req.body.northstarId = userId;

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('paramsMiddleware should call next if northstarId and campaignId were found', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = paramsMiddleware();
  t.context.req.body = {
    northstarId: userId,
    campaignId,
  };

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.not.have.been.called;
  next.should.have.been.called;
});
