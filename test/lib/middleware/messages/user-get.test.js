'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../../lib/helpers');
const stubs = require('../../../helpers/stubs');
const userFactory = require('../../../helpers/factories/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getUser = require('../../../../lib/middleware/messages/user-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

const defaultConfig = stubs.config.getUser();

// stubs
const sendErrorResponseStub = underscore.noop;
const mockUser = userFactory.getValidUser();
const userLookupStub = () => Promise.resolve(mockUser);
const userLookupFailStub = () => Promise.reject({ message: 'Epic fail' });
const userLookupNotFoundStub = () => Promise.reject({ status: 404 });

// Setup!
test.beforeEach((t) => {
  sandbox.stub(helpers.request, 'setUser')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(sendErrorResponseStub);
  sandbox.stub(helpers, 'sendErrorResponseWithSuppressHeaders')
    .returns(sendErrorResponseStub);

  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.req.userId = mockUser.id;
  t.context.res = httpMocks.createResponse();
});

// Cleanup!
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getUser injects a user into the req object when found in Northstar', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser(defaultConfig);
  sandbox.stub(helpers.user, 'fetchFromReq')
    .callsFake(userLookupStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.setUser.should.have.been.called;
  helpers.user.fetchFromReq.should.have.been.called;
  next.should.have.been.called;
});

test('getUser calls sendErrorResponse if helpers.user.fetchFromReq fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser(defaultConfig);
  sandbox.stub(helpers.user, 'fetchFromReq')
    .callsFake(userLookupFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.setUser.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  helpers.sendErrorResponseWithSuppressHeaders.should.not.have.been.called;
});

test('getUser calls sendErrorResponse if User not found and config.shouldSendError', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser(defaultConfig);
  sandbox.stub(helpers.user, 'fetchFromReq')
    .callsFake(userLookupNotFoundStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.setUser.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
  helpers.sendErrorResponseWithSuppressHeaders.should.have.been.called;
  next.should.not.have.been.called;
});

test('getUser calls next if User not found and config.shouldSendError is false', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser(stubs.config.getUser(false));
  sandbox.stub(helpers.user, 'fetchFromReq')
    .callsFake(userLookupNotFoundStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.setUser.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
  helpers.sendErrorResponseWithSuppressHeaders.should.not.have.been.called;
  next.should.have.been.called;
});

