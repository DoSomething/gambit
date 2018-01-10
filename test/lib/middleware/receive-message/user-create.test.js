'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');
const northstar = require('../../../../lib/northstar');
const helpers = require('../../../../lib/helpers');
const analyticsHelper = require('../../../../lib/helpers/analytics');
const userHelper = require('../../../../lib/helpers/user');

const stubs = require('../../../helpers/stubs');
const userFactory = require('../../../helpers/factories/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const createUser = require('../../../../lib/middleware/receive-message/user-create');

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
  sandbox.stub(analyticsHelper, 'addParameters')
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
  sandbox.stub(userHelper, 'getDefaultCreatePayloadFromReq')
    .returns(defaultPayloadStub);
  sandbox.stub(northstar, 'createUser')
    .callsFake(userCreateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  const user = t.context.req.user;

  user.should.deep.equal(mockUser);
  userHelper.getDefaultCreatePayloadFromReq.should.have.been.called;
  northstar.createUser.should.have.been.calledWith(t.context.req.userCreateData);
  next.should.have.been.called;
});

test('createUser should call next if req.user exists', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = createUser();
  t.context.req.user = mockUser;

  // test
  await middleware(t.context.req, t.context.res, next);
  analyticsHelper.addParameters.should.not.have.been.called;
  next.should.have.been.called;
});

test('createUser should call next if req.platform is slack', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = createUser();
  t.context.req.platform = 'slack';

  // test
  await middleware(t.context.req, t.context.res, next);
  analyticsHelper.addParameters.should.not.have.been.called;
  next.should.have.been.called;
});

test('createUser should call sendErrorResponse if userHelper.getDefaultCreatePayloadFromReq throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = createUser();
  sandbox.stub(userHelper, 'getDefaultCreatePayloadFromReq')
    .throws();
  sandbox.stub(northstar, 'createUser')
    .callsFake(userCreateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  northstar.createUser.should.not.have.been.called;
  analyticsHelper.addParameters.should.not.have.been.called;
  t.context.req.should.not.have.property('user');
  next.should.not.have.been.called;
});

test('createUser should call sendErrorResponse if northstar.createUser fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = createUser();
  sandbox.stub(userHelper, 'getDefaultCreatePayloadFromReq')
    .returns(defaultPayloadStub);
  sandbox.stub(northstar, 'createUser')
    .callsFake(userCreateFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  analyticsHelper.addParameters.should.not.have.been.called;
  t.context.req.should.not.have.property('user');
  next.should.not.have.been.called;
});
