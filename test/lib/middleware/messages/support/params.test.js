'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../lib/helpers');

chai.should();
chai.use(sinonChai);

// module to be tested
const params = require('../../../../../lib/middleware/messages/support/params');

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

test('params should call error if helpers.front.parseBody throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = params();
  sandbox.stub(helpers.front, 'parseBody')
    .throws();

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('params validation', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = params();
  sandbox.stub(helpers.front, 'parseBody')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setPlatform')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setOutboundMessageTemplate')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.front.parseBody.should.have.been.called;
  helpers.request.setPlatform.should.have.been.called;
  helpers.request.setOutboundMessageTemplate.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});
