'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const logger = require('heroku-logger');
const rewire = require('rewire');

const stubs = require('../../../helpers/stubs');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const cacheHelper = rewire('../../../../lib/helpers/cache');

// stubs
const contentfulEntryId = stubs.getContentfulId();
const contentfulEntry = { id: contentfulEntryId };
const rivescriptCacheId = 'contentApi';
const rivescript = '+ hello\n- hi';

const sandbox = sinon.sandbox.create();

test.beforeEach(() => {
  stubs.stubLogger(sandbox, logger);
});

test.afterEach(() => {
  sandbox.restore();
  cacheHelper.__set__('broadcastsCache', undefined);
  cacheHelper.__set__('rivescriptCache', undefined);
  cacheHelper.__set__('topicsCache', undefined);
  cacheHelper.__set__('webSignupConfirmationsCache', undefined);
});

/**
 * Broadcasts cache
 */
test('broadcasts.get should return object when cache exists', async () => {
  cacheHelper.__set__('broadcastsCache', {
    get: () => Promise.resolve(contentfulEntry),
  });
  const result = await cacheHelper.broadcasts.get(contentfulEntryId);
  result.should.deep.equal(contentfulEntry);
});

test('broadcasts.get should return falsy when cache undefined', async (t) => {
  cacheHelper.__set__('broadcastsCache', {
    get: () => Promise.resolve(null),
  });
  const result = await cacheHelper.broadcasts.get(contentfulEntryId);
  t.falsy(result);
});

test('broadcasts.get should throw when cache set fails', async (t) => {
  cacheHelper.__set__('broadcastsCache', {
    get: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.broadcasts.get(contentfulEntryId));
});

test('broadcasts.set should return an object', async () => {
  cacheHelper.__set__('broadcastsCache', {
    set: () => Promise.resolve(JSON.stringify(contentfulEntry)),
  });
  const result = await cacheHelper.broadcasts.set(contentfulEntryId);
  result.should.deep.equal(contentfulEntry);
});

/**
 * Rivescript cache
 */
test('rivescript.get should return object when cache exists', async () => {
  cacheHelper.__set__('rivescriptCache', {
    get: () => Promise.resolve(rivescript),
  });
  const result = await cacheHelper.rivescript.get(rivescriptCacheId);
  result.should.deep.equal(rivescript);
});

test('rivescript.get should return falsy when cache undefined', async (t) => {
  cacheHelper.__set__('rivescriptCache', {
    get: () => Promise.resolve(null),
  });
  const result = await cacheHelper.rivescript.get(rivescriptCacheId);
  t.falsy(result);
});

test('rivescript.get should throw when cache set fails', async (t) => {
  cacheHelper.__set__('rivescriptCache', {
    get: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.rivescript.get(rivescriptCacheId));
});

test('rivescript.set should return an object', async () => {
  cacheHelper.__set__('rivescriptCache', {
    set: () => Promise.resolve(JSON.stringify(rivescript)),
  });
  const result = await cacheHelper.rivescript.set(rivescriptCacheId);
  result.should.deep.equal(rivescript);
});

test('rivescript.set should throw when cache set fails', async (t) => {
  cacheHelper.__set__('rivescriptCache', {
    set: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.rivescript.set(rivescriptCacheId));
});

/**
 * Topics cache
 */
test('topics.get should return object when cache exists', async () => {
  cacheHelper.__set__('topicsCache', {
    get: () => Promise.resolve(contentfulEntry),
  });
  const result = await cacheHelper.topics.get(contentfulEntryId);
  result.should.deep.equal(contentfulEntry);
});

test('topics.get should return falsy when cache undefined', async (t) => {
  cacheHelper.__set__('topicsCache', {
    get: () => Promise.resolve(null),
  });
  const result = await cacheHelper.topics.get(contentfulEntryId);
  t.falsy(result);
});

test('topics.get should throw when cache set fails', async (t) => {
  cacheHelper.__set__('topicsCache', {
    get: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.topics.get(contentfulEntryId));
});

test('topics.set should return an object', async () => {
  cacheHelper.__set__('topicsCache', {
    set: () => Promise.resolve(JSON.stringify(contentfulEntry)),
  });
  const result = await cacheHelper.topics.set(contentfulEntryId);
  result.should.deep.equal(contentfulEntry);
});

/**
 * WebSignupConfirmations cache
 */
test('webSignupConfirmations.get should return object when cache exists', async () => {
  cacheHelper.__set__('webSignupConfirmationsCache', {
    get: () => Promise.resolve(contentfulEntry),
  });
  const result = await cacheHelper.webSignupConfirmations.get();
  result.should.deep.equal(contentfulEntry);
});

test('webSignupConfirmations.get should return falsy when cache undefined', async (t) => {
  cacheHelper.__set__('webSignupConfirmationsCache', {
    get: () => Promise.resolve(null),
  });
  const result = await cacheHelper.webSignupConfirmations.get();
  t.falsy(result);
});

test('webSignupConfirmations.get should throw when cache set fails', async (t) => {
  cacheHelper.__set__('webSignupConfirmationsCache', {
    get: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.webSignupConfirmations.get());
});

test('webSignupConfirmations.set should return an array', async () => {
  const data = [contentfulEntry];
  cacheHelper.__set__('webSignupConfirmationsCache', {
    set: () => Promise.resolve(JSON.stringify(data)),
  });
  const result = await cacheHelper.webSignupConfirmations.set(data);
  result.should.deep.equal(data);
});
