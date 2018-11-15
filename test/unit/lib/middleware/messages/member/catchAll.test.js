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
const catchAll = require('../../../../../../lib/middleware/messages/member/catchAll');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('catchAll should call noCampaign reply', async (t) => {
  const next = sinon.stub();
  const middleware = catchAll();
  sandbox.stub(helpers.replies, 'noCampaign')
    .returns(underscore.noop);

  await middleware(t.context.req, t.context.res, next);

  helpers.replies.noCampaign.should.have.been.calledWith(t.context.req, t.context.res);
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('catchAll should call sendErrorResponse if noCampaign reply throws', async (t) => {
  const next = sinon.stub();
  const middleware = catchAll();
  const error = stubs.getError();

  sandbox.stub(helpers.replies, 'noCampaign')
    .throws(error);

  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
