'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const logger = require('heroku-logger');
const contentful = require('../../../lib/contentful');
const Message = require('../../../app/models/Message');
const stubs = require('../../helpers/stubs');
const broadcastFactory = require('../../helpers/factories/broadcast');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const broadcastHelper = require('../../../lib/helpers/broadcast');

const broadcastId = stubs.getBroadcastId();
const mockCount = 42;
const mockWhere = {
  count: function count() {
    return mockCount;
  },
};

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

// TODO: Update tests with cache.get / cache.set
test('getBroadcastCount should return a number', () => {
  sandbox.stub(Message, 'where').returns(mockWhere);

  const result = broadcastHelper.getMessageCount(broadcastId, 'inbound');
  result.should.not.equal(mockCount);
  Message.where.should.not.have.been.called;
});
