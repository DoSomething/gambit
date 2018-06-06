'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const Promise = require('bluebird');
const rewire = require('rewire');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Module to test
const bertlyRestClient = require('../../../lib/bertly/rest-client');

const bertly = rewire('../../../lib/bertly');

const stubs = require('../../helpers/stubs');

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// @see https://github.com/DoSomething/bertly#create-redirect | Response
function getRedirect() {
  return { url: 'http://shorturl' };
}

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

test('bertly.parseLinksInTextIntoRedirects should return same text if no links found', async () => {
  const textWithNoLink = stubs.getBroadcastMessageText();
  const parsedText = await bertly.parseLinksInTextIntoRedirects(textWithNoLink);
  parsedText.should.be.equal(textWithNoLink);
});

test('bertly.restClient.createRedirect should return a rejected promise if an url is no passed', async () => {
  try {
    await bertly.restClient.createRedirect();
  } catch (error) {
    error.should.be.an.instanceOf(TypeError);
  }
});

test.serial('bertly.parseLinksInTextIntoRedirects should return same text if it cant create redirects', async () => {
  bertly.__set__('restClient', { createRedirect: () => Promise.reject(false) });
  const textWithLink = stubs.getBroadcastMessageTextWithLink();
  const parsedText = await bertly.parseLinksInTextIntoRedirects(textWithLink);
  parsedText.should.be.equal(textWithLink);
  bertly.__set__('restClient', bertlyRestClient);
});

test.serial('bertly.parseLinksInTextIntoRedirects should get redirect for found links', async () => {
  bertly.__set__('restClient', { createRedirect: () => Promise.resolve(getRedirect()) });
  const textWithLink = stubs.getBroadcastMessageTextWithLink();
  const parsedText = await bertly.parseLinksInTextIntoRedirects(textWithLink);
  parsedText.should.include(getRedirect().url);
  bertly.__set__('restClient', bertlyRestClient);
});
