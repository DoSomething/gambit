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
const defaultStats = stubs.getBroadcastStats(true);

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

test('aggregateMessagesForBroadcastId should call Messages.aggregate and return array', async () => {
  const array = ['tyrion', 'tywin', 'jamie', 'cersei'];
  sandbox.stub(Message, 'aggregate')
    .returns(Promise.resolve(array));
  const result = await broadcastHelper.aggregateMessagesForBroadcastId(broadcastId);
  Message.aggregate.should.have.been.called;
  result.should.equal(array);
});

test('parseMessageDirection should return string', (t) => {
  t.deepEqual(broadcastHelper.parseMessageDirection('inbound'), 'inbound');
  t.deepEqual(broadcastHelper.parseMessageDirection('outbound-api-import'), 'outbound');
  t.deepEqual(broadcastHelper.parseMessageDirection('outbound-api-send'), 'outbound');
  t.deepEqual(broadcastHelper.parseMessageDirection('default'), 'outbound');
});

test('aggregateMessagesForBroadcastId should throw if Messages.aggregate fails', async (t) => {
  sandbox.stub(Message, 'aggregate')
    .returns(Promise.reject(new Error()));
  await t.throws(broadcastHelper.aggregateMessagesForBroadcastId(broadcastId));
});

test('formatStats should return default object when no data is passed', () => {
  sandbox.spy(broadcastHelper, 'parseMessageDirection');
  const result = broadcastHelper.formatStats();
  result.should.deep.equal(defaultStats);
  broadcastHelper.parseMessageDirection.should.not.have.been.called;
});

test('formatStats should return object when array is passed', () => {
  sandbox.spy(broadcastHelper, 'parseMessageDirection');
  const inboundNoMacroCount = 43;
  const inboundConfirmedCampaignMacroCount = 16;
  const outboundCount = 205;
  const aggregateResults = [
    { _id: { direction: 'inbound' }, count: inboundNoMacroCount },
    {
      _id: { direction: 'inbound', macro: 'confirmedCampaign' },
      count: inboundConfirmedCampaignMacroCount,
    },
    { _id: { direction: 'outbound-api-import' }, count: outboundCount },
  ];
  const result = broadcastHelper.formatStats(aggregateResults);
  result.inbound.total.should.equal(inboundNoMacroCount + inboundConfirmedCampaignMacroCount);
  result.inbound.macros.confirmedCampaign.should.equal(inboundConfirmedCampaignMacroCount);
  result.outbound.total.should.equal(outboundCount);
  broadcastHelper.parseMessageDirection.should.have.been.calledThrice;
});

test('formatStats should return default object when array without _id property is passed', () => {
  sandbox.spy(broadcastHelper, 'parseMessageDirection');
  const aggregateResults = [
    { direction: 'inbound', count: 43 },
    { direction: 'outbound-api-import', count: 205 },
  ];
  const result = broadcastHelper.formatStats(aggregateResults);
  broadcastHelper.parseMessageDirection.should.not.have.been.called;
  result.should.deep.equal(defaultStats);
});
