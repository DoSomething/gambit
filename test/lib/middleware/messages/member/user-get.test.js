'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../../../lib/helpers');
const analyticsHelper = require('../../../../../lib/helpers/analytics');
const userFactory = require('../../../../helpers/factories/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getUser = require('../../../../../lib/middleware/messages/member/user-get');

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
  sandbox.stub(analyticsHelper, 'addCustomAttributes')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(sendErrorResponseStub);

  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

// Cleanup!
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getUser should inject a user into the req object when found in Northstar', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser();
  sandbox.stub(helpers.user, 'fetchFromReq')
    .callsFake(userLookupStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.should.have.property('user');

  const user = t.context.req.user;

  user.should.deep.equal(mockUser);
  analyticsHelper.addCustomAttributes.should.have.been.called;
  next.should.have.been.called;
});

test('getUser should call next if Northstar user not found', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser();
  sandbox.stub(helpers.user, 'fetchFromReq')
    .callsFake(userLookupNotFoundStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  analyticsHelper.addCustomAttributes.should.not.have.been.called;
  t.context.req.should.not.have.property('user');
  next.should.have.been.called;
});

test('getUser should call sendErrorResponse if fetchUser fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser();
  sandbox.stub(helpers.user, 'fetchFromReq')
    .callsFake(userLookupFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  analyticsHelper.addCustomAttributes.should.not.have.been.called;
  t.context.req.should.not.have.property('user');
  next.should.not.have.been.called;
});
