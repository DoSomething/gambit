'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const underscore = require('underscore');

const logger = require('../../../lib/logger');
const newrelic = require('newrelic');
const stubs = require('../../helpers/stubs');

const mockPayload = {
  broadcastId: stubs.getBroadcastId(),
  campaignId: stubs.getCampaignId(),
};

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const analyticsHelper = require('../../../lib/helpers/analytics');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Setup!
test.beforeEach(() => {
  stubs.stubLogger(sandbox, logger);
  sandbox.stub(newrelic, 'addCustomAttributes')
    .returns(underscore.noop);
});

// Cleanup!
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('addParameters should call newrelic.addCustomAttributes', () => {
  analyticsHelper.addParameters(mockPayload);
  newrelic.addCustomAttributes.should.have.been.called;
});

test('addParameters should call logger.debug', () => {
  analyticsHelper.addParameters(mockPayload);
  logger.debug.should.have.been.called;
});
