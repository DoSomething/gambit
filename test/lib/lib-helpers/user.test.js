'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const macroHelper = require('../../../lib/helpers/macro');
const subscriptionHelper = require('../../../lib/helpers/subscription');
const stubs = require('../../helpers/stubs');
const userFactory = require('../../helpers/factories/user');

chai.should();
chai.use(sinonChai);

// module to be tested
const userHelper = require('../../../lib/helpers/user');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
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
