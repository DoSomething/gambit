'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const superagent = require('superagent');
const config = require('../../../config/lib/gambit-campaigns');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Module to test
const gambitCampaigns = require('../../../lib/gambit-campaigns');

// stubs
const broadcastFactory = require('../../helpers/factories/broadcast');
const campaignFactory = require('../../helpers/factories/campaign');
const defaultTopicTriggerFactory = require('../../helpers/factories/defaultTopicTrigger');
const topicFactory = require('../../helpers/factories/topic');

const campaign = campaignFactory.getValidCampaign();
const campaignBroadcast = broadcastFactory.getValidCampaignBroadcast();
const defaultTopicTriggers = [
  defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger(),
  defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger(),
];
const fetchError = new Error({ message: 'Epic fail' });
const fetchSuccess = { data: defaultTopicTriggers };
const queryParams = { skip: 11 };
const topic = topicFactory.getValidTopic();

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// executeGet
test('executeGet should call superagent.get with apiUrl and parse body', async () => {
  const endpoint = 'dragons';
  const apiUrl = `${config.clientOptions.apiUrl}/${endpoint}`;
  sandbox.stub(gambitCampaigns, 'apiUrl')
    .returns(apiUrl);
  sandbox.stub(superagent, 'get')
    .callsFake(() => ({
      // TODO: These nested functions should be stubbed to verify args passed.
      set: () => { // eslint-disable-line arrow-body-style
        return {
          query: () => Promise.resolve({ body: fetchSuccess }),
        };
      },
    }));

  const result = await gambitCampaigns.executeGet(endpoint, queryParams);
  result.should.equal(fetchSuccess);
  gambitCampaigns.apiUrl.should.have.been.calledWith(endpoint);
  superagent.get.should.have.been.calledWith(apiUrl);
});

// executePost
test('executePost should call superagent.post with apiUrl and parse body', async () => {
  const endpoint = 'dragons';
  const apiUrl = `${config.clientOptions.apiUrl}/${endpoint}`;
  sandbox.stub(gambitCampaigns, 'apiUrl')
    .returns(apiUrl);
  sandbox.stub(superagent, 'post')
    .callsFake(() => ({
      // TODO: These nested functions should be stubbed to verify args passed.
      set: () => { // eslint-disable-line arrow-body-style
        return {
          send: () => Promise.resolve({ body: fetchSuccess }),
        };
      },
    }));

  const result = await gambitCampaigns.executePost(endpoint, queryParams);
  result.should.equal(fetchSuccess);
  gambitCampaigns.apiUrl.should.have.been.calledWith(endpoint);
  superagent.post.should.have.been.calledWith(apiUrl);
});


// fetchBroadcastById
test('fetchBroadcastById should return result of a successful GET /broadcasts/:id request', async () => {
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.resolve({ data: campaignBroadcast }));
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
  const fetchResponse = {
    data: [
      campaignBroadcast,
      broadcastFactory.getValidTopicBroadcast(),
    ],
  };
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.resolve(fetchResponse));
  const result = await gambitCampaigns.fetchBroadcasts(queryParams);
  result.should.deep.equal(fetchResponse);
  gambitCampaigns.executeGet.should.have.been.calledWith(config.endpoints.broadcasts, queryParams);
});

test('fetchBroadcasts should return error of failed GET /broadcasts request', async (t) => {
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.reject(fetchError));
  const result = await t.throws(gambitCampaigns.fetchBroadcasts());
  t.is(result.message, fetchError.message);
  gambitCampaigns.executeGet.should.have.been.calledWith(config.endpoints.broadcasts);
});

// fetchCampaignById
test('fetchCampaignById should return result of a successful GET /campaigns/:id request', async () => {
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.resolve({ data: campaign }));

  const result = await gambitCampaigns.fetchCampaignById(campaign.id);
  result.should.deep.equal(campaign);
  const endpoint = `${config.endpoints.campaigns}/${campaign.id}`;
  gambitCampaigns.executeGet.should.have.been.calledWith(endpoint);
});

// fetchCampaigns
test('fetchCampaigns should return result of a successful GET /campaigns request', async () => {
  const campaigns = [campaign, campaign];
  const fetchResponse = { data: campaigns };
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.resolve(fetchResponse));

  const result = await gambitCampaigns.fetchCampaigns();
  result.should.deep.equal(fetchResponse);
  gambitCampaigns.executeGet
    .should.have.been.calledWith(config.endpoints.campaigns);
});

// fetchDefaultTopicTriggers
test('fetchDefaultTopicTriggers should return result of a successful GET /fetchDefaultTopicTriggers request', async () => {
  const fetchResponse = { data: defaultTopicTriggers };
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.resolve(fetchResponse));
  const result = await gambitCampaigns.fetchDefaultTopicTriggers(queryParams);
  result.should.deep.equal(fetchResponse);
  gambitCampaigns.executeGet
    .should.have.been.calledWith(config.endpoints.defaultTopicTriggers, queryParams);
});

// fetchTopicById
test('fetchTopicById should return result of a successful GET /topics/:id request', async () => {
  sandbox.stub(gambitCampaigns, 'executeGet')
    .returns(Promise.resolve({ data: topic }));

  const result = await gambitCampaigns.fetchTopicById(topic.id);
  result.should.deep.equal(topic);
  const endpoint = `${config.endpoints.topics}/${topic.id}`;
  gambitCampaigns.executeGet.should.have.been.calledWith(endpoint);
});
