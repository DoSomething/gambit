'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const Promise = require('bluebird');
const underscore = require('underscore');

const northstar = require('../../../../lib/northstar');
const helpers = require('../../../../lib/helpers');
const userFactory = require('../../../helpers/factories/user');

const userHelper = helpers.user;

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const updateUser = require('../../../../lib/middleware/receive-message/user-update');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const mockUser = userFactory.getValidUser();
const userUpdateStub = () => Promise.resolve(mockUser);
const userUpdateFailStub = () => Promise.reject({ message: 'Epic fail' });

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.user = mockUser;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('updateUser should call next if Northstar.updateUser success', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateUser();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ });
  sandbox.stub(northstar, 'updateUser')
    .callsFake(userUpdateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.called;
  northstar.updateUser.should.have.been.called;
  next.should.have.been.called;
});

test('updateUser should call sendErrorResponse if Northstar.updateUser fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateUser();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ });
  sandbox.stub(northstar, 'updateUser')
    .callsFake(userUpdateFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.called;
  northstar.updateUser.should.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});
