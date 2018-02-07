'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const httpMocks = require('node-mocks-http');
const config = require('../../config/lib/front');


chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Module to test
const front = require('../../lib/front');

const stubs = require('../helpers/stubs');

const mockSenderHandle = stubs.getMobileNumber();
const mockMessageText = stubs.getRandomMessageText();

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// getAuthString
test('getAuthString should return a string', (t) => {
  const result = front.getAuthString();
  t.truthy(result.includes(config.clientOptions.apiToken));
});

// getSupportChannelPath
test('getSupportChannelPath should return a string', (t) => {
  const result = front.getSupportChannelPath();
  t.truthy(result.includes(config.channels.support));
});

// getMessagePayload
test('getMessagePayload should return an object', () => {
  const result = front.getMessagePayload(mockSenderHandle, mockMessageText);
  result.sender.handle.should.equal(mockSenderHandle);
  result.body.should.equal(mockMessageText);
});

