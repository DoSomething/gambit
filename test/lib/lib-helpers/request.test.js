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

// module to be tested
const requestHelper = require('../../../lib/helpers/request');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Cleanup
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('parseCampaignKeyword(req) should return trimmed lowercase req.inboundMessageText', () => {
  const text = 'Winter ';
  const trimSpy = sandbox.spy(String.prototype, 'trim');
  const toLowerCaseSpy = sandbox.spy(String.prototype, 'toLowerCase');
  const result = requestHelper.parseCampaignKeyword({ inboundMessageText: text });

  trimSpy.should.have.been.called;
  toLowerCaseSpy.should.have.been.called;
  result.should.equal('winter');
});

test('parseCampaignKeyword(req) should return null when req.inboundMessageText undefined', (t) => {
  const result = requestHelper.parseCampaignKeyword({});
  t.falsy(result);
});
