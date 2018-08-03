'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const gambitCampaigns = require('../../../../lib/gambit-campaigns');
const helpers = require('../../../../lib/helpers');
const stubs = require('../../../helpers/stubs');
const campaignFactory = require('../../../helpers/factories/campaign');
const topicFactory = require('../../../helpers/factories/topic');
const config = require('../../../../config/lib/helpers/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const topicHelper = require('../../../../lib/helpers/topic');

const hardcodedTopicId = config.hardcodedTopicIds[0];

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchById
test('fetchById should return 404 error if topicId is the random topicId', async (t) => {
  const mockTopic = topicFactory.getValidTopic();
  sandbox.stub(topicHelper, 'isDefaultTopicId')
    .returns(true);
  sandbox.stub(gambitCampaigns, 'fetchTopicById')
    .returns(Promise.resolve(mockTopic));

  const result = await t.throws(topicHelper.fetchById());
  gambitCampaigns.fetchTopicById.should.not.have.been.called;
  result.status.should.equal(404);
});

test('fetchById should call gambitCampaigns.fetchTopicById and return object if topicId is not hardcoded', async () => {
  const mockTopic = topicFactory.getValidTopic();
  sandbox.stub(topicHelper, 'isDefaultTopicId')
    .returns(false);
  sandbox.stub(topicHelper, 'isHardcodedTopicId')
    .returns(false);
  sandbox.stub(gambitCampaigns, 'fetchTopicById')
    .returns(Promise.resolve(mockTopic));

  const result = await topicHelper.fetchById();
  gambitCampaigns.fetchTopicById.should.have.been.called;
  result.should.deep.equal(mockTopic);
});

test('fetchById should return getTopicFromRivescriptTopicId if topicId is hardcoded', async () => {
  const mockTopic = topicFactory.getValidTopic();
  sandbox.stub(topicHelper, 'isDefaultTopicId')
    .returns(false);
  sandbox.stub(topicHelper, 'isHardcodedTopicId')
    .returns(true);
  sandbox.stub(topicHelper, 'getTopicFromRivescriptTopicId')
    .returns(mockTopic);

  const result = await topicHelper.fetchById(hardcodedTopicId);
  topicHelper.getTopicFromRivescriptTopicId.should.have.been.calledWith(hardcodedTopicId);
  result.should.equal(mockTopic);
});

// fetchByCampaignId
test('fetchByCampaignId should call helpers.campaign.fetchById and inject campaign property into each result array item ', async () => {
  const mockCampaign = campaignFactory.getValidCampaign();
  sandbox.stub(helpers.campaign, 'fetchById')
    .returns(Promise.resolve(mockCampaign));
  const campaignId = stubs.getCampaignId();

  const result = await topicHelper.fetchByCampaignId(campaignId);
  helpers.campaign.fetchById.should.have.been.calledWith(campaignId);
  result.forEach((topic, index) => {
    result[index].campaign.should.deep.equal(mockCampaign);
    result[index].id.should.equal(topic.id);
  });
});

// isHardcodedTopicId
test('isHardcodedTopicId should return whether topicId exists in config.hardcodedTopicIds', (t) => {
  t.truthy(topicHelper.isHardcodedTopicId(hardcodedTopicId));
  t.falsy(topicHelper.isHardcodedTopicId(stubs.getContentfulId()));
});

// isDefaultTopicId
test('isDefaultTopicId should return whether topicId is config.defaultTopicId', (t) => {
  t.truthy(topicHelper.isDefaultTopicId(config.defaultTopicId));
  t.falsy(topicHelper.isDefaultTopicId(stubs.getContentfulId()));
});

// getRenderedTextFromTopicAndTemplateName
test('getRenderedTextFromTopicAndTemplateName returns a string when template exists', () => {
  const topic = topicFactory.getValidTopic();
  const templateName = stubs.getTemplate();
  const result = topicHelper.getRenderedTextFromTopicAndTemplateName(topic, templateName);
  result.should.equal(topic.templates[templateName].rendered);
});

test('getRenderedTextFromTopicAndTemplateName throws when template undefined', (t) => {
  const topic = topicFactory.getValidTopic();
  const templateName = 'winterfell';
  t.throws(() => topicHelper.getRenderedTextFromTopicAndTemplateName(topic, templateName));
});
