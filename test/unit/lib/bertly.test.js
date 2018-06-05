'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Module to testl
const bertly = require('../../../lib/bertly');

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('bertly should respond to', () => {
  bertly.should.respondTo('isEnabled');
  bertly.should.respondTo('textHasLinks');
  bertly.should.respondTo('findAllLinks');
  bertly.should.respondTo('getRedirectForUrl');
  bertly.should.respondTo('parseLinksInTextIntoRedirects');
});

test('bertly.restClient should respond to', () => {
  bertly.restClient.should.respondTo('createRedirect');
});
