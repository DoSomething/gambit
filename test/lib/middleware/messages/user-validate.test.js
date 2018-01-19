'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../lib/helpers');
const userFactory = require('../../../helpers/factories/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const validateUser = require('../../../../lib/middleware/messages/user-validate');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const sendErrorResponseStub = underscore.noop;
const mockUser = userFactory.getValidUser();

// Setup!
test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponseWithSuppressHeaders')
    .returns(sendErrorResponseStub);

  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.req.user = mockUser;
  t.context.res = httpMocks.createResponse();
});

// Cleanup!
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('validateUser calls sendErrorResponseWithSuppressHeaders if user is not subscriber', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = validateUser();
  sandbox.stub(helpers.user, 'isSubscriber')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponseWithSuppressHeaders.should.have.been.called;
  next.should.not.have.been.called;
});