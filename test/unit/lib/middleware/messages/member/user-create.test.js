'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');
const northstar = require('../../../../../../lib/gateway');
const helpers = require('../../../../../../lib/helpers');
const requestHelper = require('../../../../../../lib/helpers/request');
const userHelper = require('../../../../../../lib/helpers/user');

const stubs = require('../../../../../helpers/stubs');
const userFactory = require('../../../../../helpers/factories/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const createUser = require('../../../../../../lib/middleware/messages/member/user-create');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const defaultPayloadStub = {
  mobile: stubs.getMobileNumber(),
};
const sendErrorResponseStub = underscore.noop;
const mockUser = userFactory.getValidUser();
const userCreateStub = () => Promise.resolve(mockUser);
const userCreateFailStub = () => Promise.reject({ message: 'Epic fail' });

// Setup!
test.beforeEach((t) => {
  sandbox.stub(helpers.request, 'setUser')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(sendErrorResponseStub);

  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.req.platform = stubs.getPlatform();
  t.context.res = httpMocks.createResponse();
});

// Cleanup!
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('createUser should inject a user into the req object when created in Northstar', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = createUser();
  sandbox.stub(requestHelper, 'isTwilio')
    .returns(true);
  sandbox.stub(userHelper, 'getCreatePayloadFromReq')
    .returns(defaultPayloadStub);
  sandbox.stub(northstar, 'createUser')
    .callsFake(userCreateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getCreatePayloadFromReq.should.have.been.called;
  northstar.createUser.should.have.been.calledWith(t.context.req.userCreateData);
  helpers.request.setUser.should.have.been.calledWith(t.context.req, mockUser);
  next.should.have.been.called;
});

test('createUser should call next if req.user exists', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = createUser();
  t.context.req.user = mockUser;
  sandbox.stub(northstar, 'createUser')
    .callsFake(userCreateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  northstar.createUser.should.not.have.been.called;
  helpers.request.setUser.should.not.have.been.called;
  next.should.have.been.called;
});

test('createUser should call next if !helpers.request.isTwilio', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = createUser();
  sandbox.stub(requestHelper, 'isTwilio')
    .returns(false);
  sandbox.stub(northstar, 'createUser')
    .callsFake(userCreateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.setUser.should.not.have.been.called;
  northstar.createUser.should.not.have.been.called;
  next.should.have.been.called;
});

test('createUser should call sendErrorResponse if userHelper.getCreatePayloadFromReq throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = createUser();
  sandbox.stub(requestHelper, 'isTwilio')
    .returns(true);
  sandbox.stub(userHelper, 'getCreatePayloadFromReq')
    .throws();
  sandbox.stub(northstar, 'createUser')
    .callsFake(userCreateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  northstar.createUser.should.not.have.been.called;
  helpers.request.setUser.should.not.have.been.called;
  next.should.not.have.been.called;
});

test('createUser should call sendErrorResponse if northstar.createUser fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = createUser();
  sandbox.stub(requestHelper, 'isTwilio')
    .returns(true);
  sandbox.stub(userHelper, 'getCreatePayloadFromReq')
    .returns(defaultPayloadStub);
  sandbox.stub(northstar, 'createUser')
    .callsFake(userCreateFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  helpers.request.setUser.should.not.have.been.called;
  next.should.not.have.been.called;
});
