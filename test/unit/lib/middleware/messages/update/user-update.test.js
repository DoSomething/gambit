'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const Promise = require('bluebird');
const underscore = require('underscore');

const logger = require('../../../../../../lib/logger');
const northstar = require('../../../../../../lib/northstar');
const helpers = require('../../../../../../lib/helpers');
const stubs = require('../../../../../helpers/stubs');
const userFactory = require('../../../../../helpers/factories/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const updateUserMiddleware = require('../../../../../../lib/middleware/messages/update/user-update');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const mockUser = userFactory.getValidUser();
const userUpdateStub = Promise.resolve(mockUser);
const userUpdateFailStub = Promise.reject({ message: 'Epic fail' });

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendResponseWithStatusCode')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('updateUserMiddleware should skip on updating the user if no user was found', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateUserMiddleware();

  await middleware(t.context.req, t.context.res, next);
  next.should.have.been.called;
});

test('updateUserMiddleware should update user if the user was found', async (t) => {
  // setup
  const undeliverableUpdatePayload = helpers.user.getUndeliverableStatusUpdatePayload();
  const next = sinon.stub();
  const middleware = updateUserMiddleware();
  sandbox.spy(helpers.user, 'getUndeliverableStatusUpdatePayload');
  sandbox.stub(northstar, 'updateUser').returns(userUpdateStub);
  t.context.req.user = mockUser;
  t.context.req.userId = mockUser.id;

  await middleware(t.context.req, t.context.res, next);
  helpers.user.getUndeliverableStatusUpdatePayload.should.have.been.called;
  northstar.updateUser.should.have.been.calledWith(mockUser.id, undeliverableUpdatePayload);
  helpers.sendResponseWithStatusCode.should.have.been.calledWith(t.context.res, 204);
  next.should.not.have.been.called;
});

test('updateUserMiddleware should respond with and error if northstar fails to update the user', async (t) => {
  // setup
  const undeliverableUpdatePayload = helpers.user.getUndeliverableStatusUpdatePayload();
  const next = sinon.stub();
  const middleware = updateUserMiddleware();
  sandbox.spy(helpers.user, 'getUndeliverableStatusUpdatePayload');
  sandbox.stub(northstar, 'updateUser').returns(userUpdateFailStub);
  t.context.req.user = mockUser;
  t.context.req.userId = mockUser.id;

  await middleware(t.context.req, t.context.res, next);
  helpers.user.getUndeliverableStatusUpdatePayload.should.have.been.called;
  northstar.updateUser.should.have.been.calledWith(mockUser.id, undeliverableUpdatePayload);
  helpers.sendResponseWithStatusCode.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});
