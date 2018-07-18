'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const config = require('../../../config/lib/gambit-campaigns');


chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Module to test
const gambitCampaigns = require('../../../lib/gambit-campaigns');

// stubs
const broadcastFactory = require('../../helpers/factories/broadcast');
const campaignFactory = require('../../helpers/factories/campaign');

const campaignBroadcast = broadcastFactory.getValidCampaignBroadcast();
const fetchError = new Error({ message: 'Epic fail' });

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// fetchBroadcastById
test('fetchBroadcastById should return result of a successful GET /broadcasts/:id request', async () => {
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.resolve(campaignBroadcast));
  const result = await gambitCampaigns.fetchBroadcastById(campaignBroadcast.id);
  result.should.deep.equal(campaignBroadcast);
  const endpoint = `${config.endpoints.broadcasts}/${campaignBroadcast.id}`;
  gambitCampaigns.executeGet.should.have.been.calledWith(endpoint);
});

test('fetchBroadcastById should return error of failed GET /broadcasts/:id request', async (t) => {
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.reject(fetchError));
  const result = await t.throws(gambitCampaigns.fetchBroadcastById());
  t.is(result.message, fetchError.message);
});

// fetchBroadcasts
test('fetchBroadcasts should return result of a successful GET /broadcasts request', async () => {
  const broadcasts = [
    campaignBroadcast,
    broadcastFactory.getValidTopicBroadcast(),
  ];
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.resolve(broadcasts));
  const result = await gambitCampaigns.fetchBroadcasts();
  result.should.deep.equal(broadcasts);
  gambitCampaigns.executeGet.should.have.been.calledWith(config.endpoints.broadcasts);
});

test('fetchBroadcasts should return error of failed GET /broadcasts request', async (t) => {
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.reject(fetchError));
  const result = await t.throws(gambitCampaigns.fetchBroadcasts());
  t.is(result.message, fetchError.message);
  gambitCampaigns.executeGet.should.have.been.calledWith(config.endpoints.broadcasts);
});

// isClosedCampaign
test('isClosedCampaign should return true when campaign is active', (t) => {
  const campaign = campaignFactory.getValidCampaign();
  const result = gambitCampaigns.isClosedCampaign(campaign);
  t.falsy(result);
});

test('isClosedCampaign should return false when campaign is closed', (t) => {
  const campaign = campaignFactory.getValidCampaign();
  campaign.status = config.closedStatusValue;
  const result = gambitCampaigns.isClosedCampaign(campaign);
  t.truthy(result);
});
