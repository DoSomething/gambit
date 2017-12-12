'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const logger = require('heroku-logger');
const rewire = require('rewire');

const contentful = require('../../../lib/contentful');
const Message = require('../../../app/models/Message');
const stubs = require('../../helpers/stubs');
const broadcastFactory = require('../../helpers/factories/broadcast');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const broadcastHelper = rewire('../../../lib/helpers/broadcast');

const broadcastId = stubs.getBroadcastId();
const broadcastStats = stubs.getBroadcastStats();

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
  // reset statsCache on each test
  broadcastHelper.__set__('statsCache', undefined);
});

test('the broadcastId should be parsed out of the query params and injected in the req object', () => {
  const req = stubs.getMockRequest({
    query: { broadcastId },
  });

  broadcastHelper.parseBody(req);
  req.broadcastId.should.be.equal(broadcastId);
});

test('parseBroadcast should return an object', () => {
  const date = Date.now();
  const broadcast = broadcastFactory.getValidBroadcast(date);
  const campaignId = stubs.getCampaignId();
  const topic = stubs.getTopic();
  const message = stubs.getBroadcastMessageText();
  const name = stubs.getBroadcastName();
  sandbox.stub(contentful, 'getCampaignIdFromBroadcast')
    .returns(campaignId);
  sandbox.stub(contentful, 'getTopicFromBroadcast')
    .returns(topic);
  sandbox.stub(contentful, 'getMessageTextFromBroadcast')
    .returns(message);

  const result = broadcastHelper.parseBroadcast(broadcast);
  result.id.should.equal(broadcastId);
  contentful.getCampaignIdFromBroadcast.should.have.been.called;
  result.campaignId.should.equal(campaignId);
  contentful.getTopicFromBroadcast.should.have.been.called;
  result.topic.should.equal(topic);
  contentful.getMessageTextFromBroadcast.should.have.been.called;
  result.message.should.equal(message);
  result.name.should.equal(name);
  result.createdAt.should.equal(date);
  result.updatedAt.should.equal(date);
});

test('getStatsCacheForBroadcastId should return object when stats cache exists', async () => {
  broadcastHelper.__set__('statsCache', {
    get: () => Promise.resolve(broadcastStats),
  });
  const result = await broadcastHelper.getStatsCacheForBroadcastId(broadcastId);
  result.should.deep.equal(broadcastStats);
});

test('getStatsCacheForBroadcastId should return falsy when stats cache undefined', async (t) => {
  broadcastHelper.__set__('statsCache', {
    get: () => Promise.resolve(null),
  });
  const result = await broadcastHelper.getStatsCacheForBroadcastId(broadcastId);
  t.falsy(result);
});

test('getStatsCacheForBroadcastId should throw when statsCache.get fails', async (t) => {
  broadcastHelper.__set__('statsCache', {
    get: () => Promise.reject(new Error()),
  });
  await t.throws(broadcastHelper.getStatsCacheForBroadcastId(broadcastId));
});

test('aggregateMessagesForBroadcastId should call Messages.aggregate and return array', async () => {
  const array = ['tyrion', 'tywin', 'jamie', 'cersei'];
  sandbox.stub(Message, 'aggregate')
    .returns(Promise.resolve(array));
  const result = await broadcastHelper.aggregateMessagesForBroadcastId(broadcastId);
  Message.aggregate.should.have.been.called;
  result.should.equal(array);
});

test('aggregateMessagesForBroadcastId should throw if Messages.aggregate fails', async (t) => {
  sandbox.stub(Message, 'aggregate')
    .returns(Promise.reject(new Error()));
  await t.throws(broadcastHelper.aggregateMessagesForBroadcastId(broadcastId));
});

test('setStatsCacheForBroadcastId should return an object', async () => {
  broadcastHelper.__set__('statsCache', {
    set: () => Promise.resolve(broadcastStats),
  });
  const result = await broadcastHelper.setStatsCacheForBroadcastId(broadcastId);
  result.should.deep.equal(broadcastStats);
});

test('aggregateMessagesForBroadcastId should throw if statsCache.set fails', async (t) => {
  broadcastHelper.__set__('statsCache', {
    set: () => Promise.reject(new Error()),
  });
  await t.throws(broadcastHelper.setStatsCacheForBroadcastId(broadcastId));
});
