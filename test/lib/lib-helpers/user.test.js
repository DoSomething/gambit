'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const crypto = require('crypto');
const underscore = require('underscore');
const macroHelper = require('../../../lib/helpers/macro');
const subscriptionHelper = require('../../../lib/helpers/subscription');
const config = require('../../../config/lib/helpers/user');

chai.should();
chai.use(sinonChai);

// module to be tested
const userHelper = require('../../../lib/helpers/user');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const stubs = require('../../helpers/stubs');
const conversationFactory = require('../../helpers/factories/conversation');
const messageFactory = require('../../helpers/factories/message');
const userFactory = require('../../helpers/factories/user');

const cryptoCreateHmacStub = {
  update() { return this; },
  digest() { return this; },
  substring() { return this; },
};
const platformUserAddressStub = {
  country: 'US',
};

test.afterEach(() => {
  sandbox.restore();
});

// createPassword
test('generatePassword', () => {
  const opts = config.createOptions;
  sandbox.stub(crypto, 'createHmac').returns(cryptoCreateHmacStub);
  userHelper.generatePassword('taco');
  crypto.createHmac.should.have.been.calledWithExactly(opts.passwordAlgorithm, opts.passwordKey);
});

// getDefaultCreatePayloadFromReq
test('getDefaultCreatePayloadFromReq should return object', () => {
  const req = {
    platform: stubs.getPlatform(),
    platformUserAddress: platformUserAddressStub,
    platformUserId: stubs.getMobileNumber(),
  };
  const mockDefaultPayload = { last_messaged_at: Date.now() };
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns(mockDefaultPayload);
  sandbox.stub(underscore, 'extend')
    .returns(platformUserAddressStub);
  sandbox.stub(userHelper, 'generatePassword')
    .returns('taco');
  const result = userHelper.getDefaultCreatePayloadFromReq(req);
  result.source.should.equal(req.platform);
  result.mobile.should.equal(req.platformUserId);
  userHelper.getDefaultUpdatePayloadFromReq.should.have.been.calledWith(req);
  underscore.extend.should.have.been.calledWith(mockDefaultPayload, req.platformUserAddress);
  userHelper.generatePassword.should.have.been.called;
});

// getDefaultUpdatePayloadFromReq
test('getDefaultUpdatePayloadFromReq should return object', () => {
  const inboundMessage = messageFactory.getValidMessage();
  const conversation = conversationFactory.getValidConversation();
  const result = userHelper.getDefaultUpdatePayloadFromReq({
    inboundMessage,
    conversation,
  });
  result.last_messaged_at.should.equal(inboundMessage.createdAt.toISOString());
  result.sms_paused.should.equal(conversation.paused);
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

// updateSubscriptionStatus
test('getSubscriptionStatusUpdate should return stop value if stop macro is passed', () => {
  const user = userFactory.getValidUser();
  const stopMacro = macroHelper.macros.subscriptionStatusStop();
  const result = userHelper.getSubscriptionStatusUpdate(user, stopMacro);
  result.should.equal(subscriptionHelper.statuses.stop());
});

test('getSubscriptionStatusUpdate should return less value if less macro is passed', () => {
  const user = userFactory.getValidUser();
  const lessMacro = macroHelper.macros.subscriptionStatusLess();
  const result = userHelper.getSubscriptionStatusUpdate(user, lessMacro);
  result.should.equal(subscriptionHelper.statuses.less());
});

test('getSubscriptionStatusUpdate should return active value if current status is stop', () => {
  const user = userFactory.getValidUser();
  user.sms_status = subscriptionHelper.statuses.stop();
  const result = userHelper.getSubscriptionStatusUpdate(user, stubs.getRandomMessageText());
  result.should.equal(subscriptionHelper.statuses.active());
});

test('getSubscriptionStatusUpdate should return active value if current status is undeliverable', () => {
  const user = userFactory.getValidUser();
  user.sms_status = subscriptionHelper.statuses.undeliverable();
  const result = userHelper.getSubscriptionStatusUpdate(user, stubs.getRandomMessageText());
  result.should.equal(subscriptionHelper.statuses.active());
});

test('getSubscriptionStatusUpdate should return active value if current status is null', () => {
  const user = userFactory.getValidUser();
  user.sms_status = null;
  const result = userHelper.getSubscriptionStatusUpdate(user, stubs.getRandomMessageText());
  result.should.equal(subscriptionHelper.statuses.active());
});

test('getSubscriptionStatusUpdate should return falsy if current status is active', (t) => {
  const user = userFactory.getValidUser();
  const result = userHelper.getSubscriptionStatusUpdate(user, stubs.getRandomMessageText());
  t.falsy(result);
});
