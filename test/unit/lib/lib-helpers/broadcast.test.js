'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const logger = require('heroku-logger');

const Message = require('../../../../app/models/Message');
const stubs = require('../../../helpers/stubs');

const config = require('../../../../config/lib/helpers/broadcast');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const broadcastHelper = require('../../../../lib/helpers/broadcast');

// stubs
const broadcastId = stubs.getBroadcastId();
const defaultStats = stubs.getBroadcastStats(true);
const mockAggregateResults = stubs.getBroadcastAggregateMessagesResults();
const webhookContentTypeHeader = 'application/json';

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


test('aggregateMessagesForBroadcastId should call Messages.aggregate and return array', async () => {
  sandbox.stub(Message, 'aggregate')
    .returns(Promise.resolve(mockAggregateResults));
  const result = await broadcastHelper.aggregateMessagesForBroadcastId(broadcastId);
  Message.aggregate.should.have.been.called;
  result.should.equal(mockAggregateResults);
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
  const result = broadcastHelper.formatStats(mockAggregateResults);
  result.inbound.total.should.be.a('number');
  result.inbound.macros.confirmedCampaign.should.be.a('number');
  result.outbound.total.should.be.a('number');
  const numResults = mockAggregateResults.length;
  broadcastHelper.parseMessageDirection.should.have.been.called.with.callCount(numResults);
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

test('getWebhook should return an object with body of a POST Broadcast Message request', () => {
  const mockRequest = {
    broadcastId,
  };
  const result = broadcastHelper.getWebhook(mockRequest);
  result.headers['Content-Type'].should.equal(webhookContentTypeHeader);
  result.body.northstarId.should.equal(config.customerIo.userIdField);
  result.body.broadcastId.should.equal(broadcastId);
  result.should.have.property('url');
});
