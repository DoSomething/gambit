'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const underscore = require('underscore');
const httpMocks = require('node-mocks-http');
const northstar = require('../../../../lib/northstar');
const helpers = require('../../../../lib/helpers');

const subscriptionHelper = require('../../../../lib/helpers/subscription');

chai.should();
chai.use(sinonChai);

// module to be tested
const userHelper = require('../../../../lib/helpers/user');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const stubs = require('../../../helpers/stubs');
const conversationFactory = require('../../../helpers/factories/conversation');
const messageFactory = require('../../../helpers/factories/message');
const userFactory = require('../../../helpers/factories/user');

const mockUser = userFactory.getValidUser();
const userLookupStub = () => Promise.resolve(mockUser);
const platformUserAddressStub = {
  country: 'US',
};

test.beforeEach((t) => {
  t.context.req = httpMocks.createRequest();
  sandbox.stub(helpers.user, 'createVotingPlan')
    .returns(Promise.resolve(mockUser));
});

test.afterEach((t) => {
  t.context = {};
  sandbox.restore();
});

// fetchById
test('fetchById calls northstar.fetchUserById', async () => {
  sandbox.stub(northstar, 'fetchUserById')
    .returns(userLookupStub);

  const result = await userHelper.fetchById(mockUser.id);
  northstar.fetchUserById.should.have.been.called;
  result.should.deep.equal(userLookupStub);
});

// fetchByMobile
test('fetchByMobile calls northstar.fetchUserById', async () => {
  sandbox.stub(northstar, 'fetchUserByMobile')
    .returns(userLookupStub);

  const result = await userHelper.fetchByMobile(mockUser.mobile);
  northstar.fetchUserByMobile.should.have.been.called;
  result.should.deep.equal(userLookupStub);
});

// fetchFromReq
test('fetchFromReq calls fetchById if !req.platformUserId', async (t) => {
  sandbox.stub(userHelper, 'fetchById')
    .returns(userLookupStub);
  sandbox.stub(userHelper, 'fetchByMobile')
    .returns(userLookupStub);
  t.context.req.userId = stubs.getUserId();

  await userHelper.fetchFromReq(t.context.req);
  userHelper.fetchById.should.not.have.been.calledWith(t.context.req, t.context.req.userId);
  userHelper.fetchByMobile.should.not.have.been.called;
});

test('fetchFromReq calls fetchByMobile if req.platformUserId', async (t) => {
  sandbox.stub(userHelper, 'fetchById')
    .returns(userLookupStub);
  sandbox.stub(userHelper, 'fetchByMobile')
    .returns(userLookupStub);
  t.context.req.platformUserId = stubs.getMobileNumber();

  await userHelper.fetchFromReq(t.context.req);
  userHelper.fetchByMobile.should.have.been.called;
  userHelper.fetchById.should.not.have.been.called;
});

// getCreatePayloadFromReq
test('getCreatePayloadFromReq should return object', () => {
  const req = {
    platform: stubs.getPlatform(),
    platformUserAddress: platformUserAddressStub,
    platformUserId: stubs.getMobileNumber(),
  };
  sandbox.stub(underscore, 'extend')
    .returns(platformUserAddressStub);
  const result = userHelper.getCreatePayloadFromReq(req);
  result.source.should.equal(req.platform);
  result.mobile.should.equal(req.platformUserId);
});

// getDefaultUpdatePayloadFromReq
test('getDefaultUpdatePayloadFromReq should return object', () => {
  const inboundMessage = messageFactory.getValidMessage();
  const conversation = conversationFactory.getValidConversation();
  const isSupportTopic = true;
  sandbox.stub(conversation, 'isSupportTopic')
    .returns(isSupportTopic);
  const result = userHelper.getDefaultUpdatePayloadFromReq({
    inboundMessage,
    conversation,
  });
  result.last_messaged_at.should.equal(inboundMessage.createdAt.toISOString());
  result.sms_paused.should.equal(isSupportTopic);
});

// hasAddress
test('hasAddress should return true if user has address properties set', (t) => {
  const user = userFactory.getValidUserWithAddress();
  t.true(userHelper.hasAddress(user));
});

test('hasAddress should return false if user does not have address properties set', (t) => {
  const user = userFactory.getValidUser();
  t.falsy(userHelper.hasAddress(user));
});

// isPaused
test('isPaused should return user.sms_paused', (t) => {
  const user = userFactory.getValidUser();
  const result = userHelper.isPaused(user);
  t.deepEqual(result, user.sms_paused);
});

// setPendingSubscriptionStatusForUserId
test('setPendingSubscriptionStatusForUserId should call northstar.updateUser with pending status', async () => {
  const userId = mockUser.id;
  sandbox.stub(northstar, 'updateUser')
    .returns(Promise.resolve({}));

  await userHelper.setPendingSubscriptionStatusForUserId(userId);
  northstar.updateUser.should.have.been
    .calledWith(userId, { sms_status: subscriptionHelper.statuses.pending() });
});

// updateByMemberMessageReq
test('updateByMemberMessageReq should return rejected error if getDefaultUpdatePayloadFromReq throws', async (t) => {
  const error = { message: 'Epic fail' };
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .throws(error);
  t.context.req.macro = stubs.getMacro();

  const result = await t.throws(userHelper.updateByMemberMessageReq(t.context.req));
  result.should.deep.equal(error);
});

test('updateByMemberMessageReq should return rejected error if getProfileUpdate throws', async (t) => {
  const error = { message: 'Epic fail' };
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({});
  sandbox.stub(helpers.macro, 'getProfileUpdate')
    .throws(error);
  t.context.req.macro = stubs.getMacro();

  const result = await t.throws(userHelper.updateByMemberMessageReq(t.context.req));
  result.should.deep.equal(error);
});

test('updateByMemberMessageReq should return northstar.updateUser', async (t) => {
  t.context.req.user = mockUser;
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ abc: 1 });
  sandbox.stub(helpers.macro, 'getProfileUpdate')
    .returns({ def: 2 });
  sandbox.stub(northstar, 'updateUser')
    .returns(Promise.resolve(mockUser));
  sandbox.stub(userHelper, 'hasAddress')
    .returns(false);
  t.context.req.macro = stubs.getMacro();
  sandbox.stub(helpers.macro, 'isCompletedVotingPlan')
    .returns(false);

  const result = await userHelper.updateByMemberMessageReq(t.context.req);
  northstar.updateUser.should.have.been.calledWith(mockUser.id, { abc: 1, def: 2 });
  userHelper.hasAddress.should.not.have.been.called;
  helpers.user.createVotingPlan.should.not.have.been.called;
  result.should.deep.equal(mockUser);
});

test('updateByMemberMessageReq should not send req.platformUserAddress if user has address', async (t) => {
  t.context.req.user = mockUser;
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ abc: 1 });
  sandbox.stub(helpers.macro, 'getProfileUpdate')
    .returns({ def: 2 });
  sandbox.stub(northstar, 'updateUser')
    .returns(Promise.resolve(mockUser));
  t.context.req.platformUserAddress = { ghi: 3 };
  sandbox.stub(userHelper, 'hasAddress')
    .returns(true);
  t.context.req.macro = stubs.getMacro();
  sandbox.stub(helpers.macro, 'isCompletedVotingPlan')
    .returns(false);

  const result = await userHelper.updateByMemberMessageReq(t.context.req);
  northstar.updateUser.should.have.been.calledWith(mockUser.id, { abc: 1, def: 2 });
  userHelper.hasAddress.should.have.been.calledWith(t.context.req.user);
  helpers.user.createVotingPlan.should.not.have.been.called;
  result.should.deep.equal(mockUser);
});

test('updateByMemberMessageReq should not send req.platformUserAddress if user does not have address', async (t) => {
  t.context.req.user = mockUser;
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ abc: 1 });
  sandbox.stub(helpers.macro, 'getProfileUpdate')
    .returns({ def: 2 });
  sandbox.stub(northstar, 'updateUser')
    .returns(Promise.resolve(mockUser));
  t.context.req.platformUserAddress = { ghi: 3 };
  sandbox.stub(userHelper, 'hasAddress')
    .returns(false);
  t.context.req.macro = stubs.getMacro();
  sandbox.stub(helpers.macro, 'isCompletedVotingPlan')
    .returns(false);

  const result = await userHelper.updateByMemberMessageReq(t.context.req);
  northstar.updateUser.should.have.been.calledWith(mockUser.id, { abc: 1, def: 2, ghi: 3 });
  userHelper.hasAddress.should.have.been.calledWith(t.context.req.user);
  helpers.user.createVotingPlan.should.not.have.been.called;
  result.should.deep.equal(mockUser);
});

test('updateByMemberMessageReq should call createVotingPlan if macro isCompletedVotingPlan', async (t) => {
  t.context.req.user = mockUser;
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ abc: 1 });
  sandbox.stub(helpers.macro, 'getProfileUpdate')
    .returns({ def: 2 });
  sandbox.stub(northstar, 'updateUser')
    .returns(Promise.resolve(mockUser));
  t.context.req.platformUserAddress = { ghi: 3 };
  sandbox.stub(userHelper, 'hasAddress')
    .returns(false);
  t.context.req.macro = stubs.getMacro();
  sandbox.stub(helpers.macro, 'isCompletedVotingPlan')
    .returns(true);

  const result = await userHelper.updateByMemberMessageReq(t.context.req);
  northstar.updateUser.should.have.been.calledWith(mockUser.id, { abc: 1, def: 2, ghi: 3 });
  userHelper.hasAddress.should.have.been.calledWith(t.context.req.user);
  helpers.user.createVotingPlan.should.have.been.calledWith(t.context.req.user);
  result.should.deep.equal(mockUser);
});
