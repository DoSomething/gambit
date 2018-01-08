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
const stubs = require('../../../helpers/stubs');
const userFactory = require('../../../helpers/factories/user');

const repliesHelper = helpers.replies;
const subscriptionHelper = helpers.subscription;
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
const mockDefaultUserUpdateData = {
  last_messaged_at: Date.now(),
  sms_paused: false,
};
const userUpdateStub = () => Promise.resolve(mockUser);
const userUpdateFailStub = () => Promise.reject({ message: 'Epic fail' });

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  sandbox.stub(repliesHelper, 'subscriptionStatusLess')
    .returns(underscore.noop);
  sandbox.stub(repliesHelper, 'subscriptionStatusStop')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.user = mockUser;
  t.context.req.rivescriptReplyText = stubs.getRandomMessageText();
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
    .returns(mockDefaultUserUpdateData);
  sandbox.stub(userHelper, 'getSubscriptionStatusUpdate')
    .returns(null);
  sandbox.stub(northstar, 'updateUser')
    .callsFake(userUpdateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.called;
  userHelper.getSubscriptionStatusUpdate.should.have.been.called;
  t.context.req.userUpdateData.should.deep.equal(mockDefaultUserUpdateData);
  northstar.updateUser.should.have.been.called;
  repliesHelper.subscriptionStatusLess.should.not.have.been.called;
  repliesHelper.subscriptionStatusStop.should.not.have.been.called;
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('updateUser should call sendErrorResponse if Northstar.updateUser fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateUser();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns(mockDefaultUserUpdateData);
  sandbox.stub(userHelper, 'getSubscriptionStatusUpdate')
    .returns(null);
  sandbox.stub(northstar, 'updateUser')
    .callsFake(userUpdateFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.called;
  userHelper.getSubscriptionStatusUpdate.should.have.been.called;
  northstar.updateUser.should.have.been.called;
  repliesHelper.subscriptionStatusLess.should.not.have.been.called;
  repliesHelper.subscriptionStatusStop.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('updateUser should call sendErrorResponse if getDefaultUpdatePayloadFromReq throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateUser();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .throws();
  sandbox.stub(userHelper, 'getSubscriptionStatusUpdate')
    .returns(null);
  sandbox.stub(userHelper, 'hasAddress')
    .returns(false);
  sandbox.stub(northstar, 'updateUser')
    .callsFake(userUpdateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.called;
  userHelper.getSubscriptionStatusUpdate.should.not.have.been.called;
  userHelper.hasAddress.should.not.have.been.called;
  northstar.updateUser.should.not.have.been.called;
  repliesHelper.subscriptionStatusLess.should.not.have.been.called;
  repliesHelper.subscriptionStatusStop.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('updateUser should call getSubscriptionStatusUpdate if hasAddress throws', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateUser();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns(mockDefaultUserUpdateData);
  sandbox.stub(userHelper, 'getSubscriptionStatusUpdate')
    .throws();
  sandbox.stub(userHelper, 'hasAddress')
    .returns(false);
  sandbox.stub(northstar, 'updateUser')
    .callsFake(userUpdateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.called;
  userHelper.getSubscriptionStatusUpdate.should.have.been.called;
  userHelper.hasAddress.should.not.have.been.called;
  northstar.updateUser.should.not.have.been.called;
  repliesHelper.subscriptionStatusLess.should.not.have.been.called;
  repliesHelper.subscriptionStatusStop.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('updateUser should call replies.subscriptionStatusLess if statusUpdate is less', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateUser();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ });
  sandbox.stub(userHelper, 'getSubscriptionStatusUpdate')
    .returns(subscriptionHelper.statuses.less());
  sandbox.stub(northstar, 'updateUser')
    .callsFake(userUpdateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.called;
  userHelper.getSubscriptionStatusUpdate.should.have.been.called;
  northstar.updateUser.should.have.been.called;
  repliesHelper.subscriptionStatusLess.should.have.been.called;
  repliesHelper.subscriptionStatusStop.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('updateUser should call replies.subscriptionStatusStop if statusUpdate is stop', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateUser();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ });
  sandbox.stub(userHelper, 'getSubscriptionStatusUpdate')
    .returns(subscriptionHelper.statuses.stop());
  sandbox.stub(northstar, 'updateUser')
    .callsFake(userUpdateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.called;
  userHelper.getSubscriptionStatusUpdate.should.have.been.called;
  northstar.updateUser.should.have.been.called;
  repliesHelper.subscriptionStatusLess.should.not.have.been.called;
  repliesHelper.subscriptionStatusStop.should.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('updateUser should not set address if req.user.platformUserAddress undefined', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateUser();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns(mockDefaultUserUpdateData);
  sandbox.stub(userHelper, 'getSubscriptionStatusUpdate')
    .returns(null);
  sandbox.stub(userHelper, 'hasAddress')
    .returns(false);
  sandbox.stub(northstar, 'updateUser')
    .callsFake(userUpdateStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.called;
  userHelper.getSubscriptionStatusUpdate.should.have.been.called;
  userHelper.hasAddress.should.not.have.been.called;
  t.context.req.userUpdateData.should.not.have.property('country');
  northstar.updateUser.should.have.been.called;
  repliesHelper.subscriptionStatusLess.should.not.have.been.called;
  repliesHelper.subscriptionStatusStop.should.not.have.been.called;
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('updateUser should set address when req.user does not have address', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateUser();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns(mockDefaultUserUpdateData);
  sandbox.stub(userHelper, 'getSubscriptionStatusUpdate')
    .returns(null);
  sandbox.stub(userHelper, 'hasAddress')
    .returns(false);
  sandbox.stub(northstar, 'updateUser')
    .callsFake(userUpdateStub);
  t.context.req.userId = mockUser.id;
  t.context.req.platformUserAddress = { country: 'US' };

  // test
  await middleware(t.context.req, t.context.res, next);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.called;
  userHelper.getSubscriptionStatusUpdate.should.have.been.called;
  userHelper.hasAddress.should.have.been.called;
  t.context.req.userUpdateData.should.have.property('country');
  northstar.updateUser
    .should.have.been.calledWith(t.context.req.userId, t.context.req.userUpdateData);
  repliesHelper.subscriptionStatusLess.should.not.have.been.called;
  repliesHelper.subscriptionStatusStop.should.not.have.been.called;
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});
