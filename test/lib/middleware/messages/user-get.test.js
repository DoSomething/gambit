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
const userFactory = require('../../../helpers/factories/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getUser = require('../../../../lib/middleware/messages/user-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const sendErrorResponseStub = underscore.noop;
const mockUser = userFactory.getValidUser();
const userLookupStub = () => Promise.resolve(mockUser);
const userLookupFailStub = () => Promise.reject({ message: 'Epic fail' });
const userLookupNotFoundStub = () => Promise.reject({ status: 404 });

// Setup!
test.beforeEach((t) => {
  sandbox.spy(helpers, 'addBlinkSuppressHeaders');
  sandbox.stub(helpers, 'sendErrorResponse')
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
  const middleware = getUser();
  sandbox.stub(helpers.user, 'fetchById')
    .callsFake(userLookupStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.should.have.property('user');

  const user = t.context.req.user;

  user.should.deep.equal(mockUser);
  helpers.user.fetchById.should.have.been.called;
  next.should.have.been.called;
});

test('getUser calls sendErrorResponse if helpers.user.fetchById fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser();
  sandbox.stub(helpers.user, 'fetchById')
    .callsFake(userLookupFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  helpers.addBlinkSuppressHeaders.should.not.have.been.called;
  t.context.req.should.not.have.property('user');
  next.should.not.have.been.called;
});

test('getUser calls sendErrorResponse if helpers.user.fetchById response is status 404', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser();
  sandbox.stub(helpers.user, 'fetchById')
    .callsFake(userLookupNotFoundStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  helpers.addBlinkSuppressHeaders.should.have.been.called;
  t.context.req.should.not.have.property('user');
  next.should.not.have.been.called;
});
