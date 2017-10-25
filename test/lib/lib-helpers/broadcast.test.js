'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const logger = require('heroku-logger');
const stubs = require('../../helpers/stubs');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const broadcastHelper = require('../../../lib/helpers/broadcast');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Setup!
test.beforeEach(() => {
  stubs.stubLogger(sandbox, logger);
});

// Cleanup!
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('the broadcastId should be parsed out of the query params and injected in the req object', () => {
  const broadcastId = 'test';
  const req = stubs.getMockRequest({
    query: { broadcastId },
  });

  broadcastHelper.parseBody(req);
  req.broadcastId.should.be.equal(broadcastId);
});

test('the broadcastId should be parsed out of the body params and injected in the req object', () => {
  const broadcastId = 'test';
  const req = stubs.getMockRequest({
    body: { broadcastId },
  });
  broadcastHelper.parseBody(req);
  req.broadcastId.should.be.equal(broadcastId);
});
