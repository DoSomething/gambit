'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const logger = require('heroku-logger');
const rewire = require('rewire');

const stubs = require('../../helpers/stubs');
const broadcastFactory = require('../../helpers/factories/broadcast');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const cacheHelper = rewire('../../../lib/helpers/cache');

// stubs
const broadcastId = stubs.getBroadcastId();
const broadcast = broadcastFactory.getValidCampaignBroadcast();
const broadcastStats = stubs.getBroadcastStats();
const campaignId = stubs.getCampaignId();
const campaign = { id: campaignId, title: 'Winter' };

const sandbox = sinon.sandbox.create();

test.beforeEach(() => {
  stubs.stubLogger(sandbox, logger);
});

test.afterEach(() => {
  sandbox.restore();
  cacheHelper.__set__('broadcastsCache', undefined);
  cacheHelper.__set__('broadcastStatsCache', undefined);
  cacheHelper.__set__('campaignsCache', undefined);
});

/**
 * Broadcasts
 */
test('broadcasts.get should return object when cache exists', async () => {
  cacheHelper.__set__('broadcastsCache', {
    get: () => Promise.resolve(broadcast),
  });
  const result = await cacheHelper.broadcasts.get(broadcastId);
  result.should.deep.equal(broadcast);
});

test('broadcasts.get should return falsy when cache undefined', async (t) => {
  cacheHelper.__set__('broadcastsCache', {
    get: () => Promise.resolve(null),
  });
  const result = await cacheHelper.broadcasts.get(broadcastId);
  t.falsy(result);
});

test('broadcasts.get should throw when cache set fails', async (t) => {
  cacheHelper.__set__('broadcastsCache', {
    get: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.broadcasts.get(broadcastId));
});

test('broadcasts.set should return an object', async () => {
  cacheHelper.__set__('broadcastsCache', {
    set: () => Promise.resolve(broadcast),
  });
  const result = await cacheHelper.broadcasts.set(broadcastId);
  result.should.deep.equal(broadcast);
});

test('broadcasts.set should throw when cache set fails', async (t) => {
  cacheHelper.__set__('broadcastsCache', {
    set: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.broadcasts.set(broadcastId));
});

/**
 * Broadcast Stats
 */
test('broadcastStats.get should return object when cache exists', async () => {
  cacheHelper.__set__('broadcastStatsCache', {
    get: () => Promise.resolve(broadcastStats),
  });
  const result = await cacheHelper.broadcastStats.get(broadcastId);
  result.should.deep.equal(broadcastStats);
});

test('broadcastStats.get should return falsy when cache undefined', async (t) => {
  cacheHelper.__set__('broadcastStatsCache', {
    get: () => Promise.resolve(null),
  });
  const result = await cacheHelper.broadcastStats.get(broadcastId);
  t.falsy(result);
});

test('broadcastStats.get should throw when cache set fails', async (t) => {
  cacheHelper.__set__('broadcastStatsCache', {
    get: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.broadcastStats.get(broadcastId));
});

test('broadcastStats.set should return an object', async () => {
  cacheHelper.__set__('broadcastStatsCache', {
    set: () => Promise.resolve(broadcastStats),
  });
  const result = await cacheHelper.broadcastStats.set(broadcastId);
  result.should.deep.equal(broadcastStats);
});

test('broadcastStats.set should throw when cache set fails', async (t) => {
  cacheHelper.__set__('broadcastStatsCache', {
    set: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.broadcastStats.set(broadcastId));
});

/**
 * Campaigns
 */
test('campaigns.get should return object when cache exists', async () => {
  cacheHelper.__set__('campaignsCache', {
    get: () => Promise.resolve(campaign),
  });
  const result = await cacheHelper.campaigns.get(campaignId);
  result.should.deep.equal(campaign);
});

test('campaigns.get should return falsy when cache undefined', async (t) => {
  cacheHelper.__set__('campaignsCache', {
    get: () => Promise.resolve(null),
  });
  const result = await cacheHelper.campaigns.get(campaignId);
  t.falsy(result);
});

test('campaigns.get should return an object', async () => {
  cacheHelper.__set__('campaignsCache', {
    set: () => Promise.resolve(campaign),
  });
  const result = await cacheHelper.campaigns.set(campaignId);
  result.should.deep.equal(campaign);
});

test('campaigns.set should throw when cache set fails', async (t) => {
  cacheHelper.__set__('campaignsCache', {
    set: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.campaigns.set(campaignId));
});
