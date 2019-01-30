'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const underscore = require('underscore');

const logger = require('../../../../lib/logger');
const newrelic = require('newrelic');
const stubs = require('../../../helpers/stubs');

const mockPayload = {
  broadcastId: stubs.getBroadcastId(),
  campaignId: stubs.getCampaignId(),
};

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const analyticsHelper = require('../../../../lib/helpers/analytics');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Setup!
test.beforeEach(() => {
  stubs.stubLogger(sandbox, logger);
  sandbox.stub(newrelic, 'addCustomAttributes')
    .returns(underscore.noop);
  sandbox.stub(newrelic, 'noticeError')
    .returns(underscore.noop);
});

// Cleanup!
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('addCustomAttributes should call newrelic.addCustomAttributes', () => {
  analyticsHelper.addCustomAttributes(mockPayload);
  newrelic.addCustomAttributes.should.have.been.called;
});

test('addCustomAttributes should call logger.debug', () => {
  analyticsHelper.addCustomAttributes(mockPayload);
  logger.debug.should.have.been.called;
});

test('addTwilioError should call addCustomAttributes', () => {
  sandbox.stub(analyticsHelper, 'addCustomAttributes')
    .returns(underscore.noop);
  const error = stubs.twilio.getPostMessageError();
  analyticsHelper.addTwilioError(error);
  analyticsHelper.addCustomAttributes.should.have.been.called;
});

test('getErrorNoticeableMethod should return a function that calls newrelic.noticeError if an Error is passed as argument', () => {
  const dummyFunction = () => true;
  const decoratedDummyFunction = analyticsHelper.getErrorNoticeableMethod(dummyFunction);
  decoratedDummyFunction(new Error('boom!'));
  newrelic.noticeError.should.have.been.called;
});

test('getErrorNoticeableMethod should return a function that doesn\'t call newrelic.noticeError if no Error is passed as argument', () => {
  const dummyFunction = () => true;
  const decoratedDummyFunction = analyticsHelper.getErrorNoticeableMethod(dummyFunction);
  decoratedDummyFunction('hi', 'my', 'name', 'is');
  newrelic.noticeError.should.not.have.been.called;
});
