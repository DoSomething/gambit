'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// app modules
const config = require('../../../../config/lib/helpers/subscription');

const statuses = config.subscriptionStatuses;

// module to be tested
const subscriptionHelper = require('../../../../lib/helpers/subscription');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Cleanup
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('subscriptionHelper.statuses.x() should be equal to config.subscriptionStatusValues.x', () => {
  Object.keys(statuses).forEach((statusName) => {
    subscriptionHelper.statuses[statusName]()
      .should.be.equal(config.subscriptionStatuses[statusName]);
  });
});
