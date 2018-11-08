'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const gambitCampaigns = require('../../../../lib/gambit-campaigns');
const helpers = require('../../../../lib/helpers');
const stubs = require('../../../helpers/stubs');
const broadcastFactory = require('../../../helpers/factories/broadcast');
const campaignFactory = require('../../../helpers/factories/campaign');
const topicFactory = require('../../../helpers/factories/topic');
const config = require('../../../../config/lib/helpers/topic');
const templateConfig = require('../../../../config/lib/helpers/template');

chai.should();
chai.use(sinonChai);

// module to be tested
const topicHelper = require('../../../../lib/helpers/topic');

const mockRivescriptTopicId = config.rivescriptTopics.default.id;
const mockDeparsedRivescript = { topics: {} };
mockDeparsedRivescript.topics[mockRivescriptTopicId] = [];
const sandbox = sinon.sandbox.create();

test.beforeEach(() => {
  sandbox.stub(helpers.rivescript, 'getDeparsedRivescript')
    .returns(mockDeparsedRivescript);
});

test.afterEach(() => {
  sandbox.restore();
});

// fetchById
test('fetchById should return gambitCampaigns.fetchTopicById', async () => {
  const topic = topicFactory.getValidTopic();
  const topicId = topic.id;
  sandbox.stub(gambitCampaigns, 'fetchTopicById')
    .returns(Promise.resolve(topic));

  const result = await topicHelper.fetchById(topicId);
  gambitCampaigns.fetchTopicById.should.have.been.calledWith(topicId);
  result.should.deep.equal(topic);
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

// getAskSubscriptionStatusTopic
test('getAskSubscriptionStatusTopic should return config.rivescriptTopics.askSubscriptionStatus', () => {
  const result = topicHelper.getAskSubscriptionStatusTopic();
  result.should.deep.equal(config.rivescriptTopics.askSubscriptionStatus);
});

// getById
test('getById should return getRivescriptTopicById if isRivescriptTopicId', async () => {
  const topicId = topicHelper.getDefaultTopicId();
  const result = await topicHelper.getById(topicId);
  result.should.deep.equal(topicHelper.getRivescriptTopicById(topicId));
});

test('getById should return fetchById if not isRivescriptTopicId', async () => {
  const topic = topicFactory.getValidAutoReply();
  const topicId = stubs.getContentfulId();
  sandbox.stub(topicHelper, 'fetchById')
    .returns(Promise.resolve(topic));

  const result = await topicHelper.getById(topicId);
  result.should.deep.equal(topic);
});

// getDefaultTopic
test('getDefaultTopic should return config.rivescriptTopics.default', () => {
  const result = topicHelper.getDefaultTopic();
  result.should.deep.equal(config.rivescriptTopics.default);
});

// getDefaultTopicId
test('getDefaultTopicId should return config.rivescriptTopics.default.id', (t) => {
  t.is(topicHelper.getDefaultTopicId(), config.rivescriptTopics.default.id);
  t.not(topicHelper.isDefaultTopicId(), stubs.getContentfulId());
});

// getRivescriptTopicById
test('getRivescriptTopicById returns object with type rivescript and given id', () => {
  const result = topicHelper.getRivescriptTopicById(mockRivescriptTopicId);
  result.id.should.equal(mockRivescriptTopicId);
  result.type.should.equal('rivescript');
  result.name.should.equal(mockRivescriptTopicId);
});

// getSupportTopic
test('getSupportTopic should return config.rivescriptTopics.support', () => {
  const result = topicHelper.getSupportTopic();
  result.should.deep.equal(config.rivescriptTopics.support);
});

// hasCampaign
test('hasCampaign should return boolean of whether topic.campaign.id exists', (t) => {
  t.truthy(topicHelper.hasCampaign(topicFactory.getValidTextPostConfig()));
  t.falsy(topicHelper.hasCampaign(topicFactory.getValidTopicWithoutCampaign()));
});

// isAskSubscriptionStatus
test('isAskSubscriptionStatus returns whether topic is rivescriptTopics.askSubscriptionStatus', (t) => {
  const mockTopic = topicFactory.getValidTopic();
  t.truthy(topicHelper.isAskSubscriptionStatus(config.rivescriptTopics.askSubscriptionStatus));
  t.falsy(topicHelper.isAskSubscriptionStatus(mockTopic));
});

// isAskVotingPlanStatus
test('isAskVotingPlanStatus returns whether topic is rivescriptTopics.askVotingPlanStatus', (t) => {
  const mockTopic = topicFactory.getValidTopic();
  t.truthy(topicHelper.isAskVotingPlanStatus(broadcastFactory.getValidAskVotingPlanStatus()));
  t.falsy(topicHelper.isAskVotingPlanStatus(mockTopic));
});

// isAskYesNo
test('isAskYesNo returns whether topic type is askYesNo', (t) => {
  t.truthy(topicHelper.isAskYesNo(broadcastFactory.getValidAskYesNo()));
  t.falsy(topicHelper.isAskYesNo(topicFactory.getValidAutoReply()));
});

// isAutoReply
test('isAutoReply returns whether topic type is autoReply', (t) => {
  t.truthy(topicHelper.isAutoReply(topicFactory.getValidAutoReply()));
  t.falsy(topicHelper.isAutoReply(topicFactory.getValidTextPostConfig()));
});

// isBroadcastable
test('isBroadcastable returns whether topic is rivescriptTopics.askVotingPlanStatus', (t) => {
  const mockTopic = topicFactory.getValidTopic();
  t.truthy(topicHelper.isBroadcastable(broadcastFactory.getValidAskVotingPlanStatus()));
  t.falsy(topicHelper.isBroadcastable(mockTopic));
});

// isRivescriptTopicId
test('isRivescriptTopicId should return whether topicId exists deparsed rivescript topics', (t) => {
  t.truthy(topicHelper.isRivescriptTopicId(mockRivescriptTopicId));
  t.falsy(topicHelper.isRivescriptTopicId(stubs.getContentfulId()));
});

// isDefaultTopicId
test('isDefaultTopicId should return whether topicId is config.defaultTopicId', (t) => {
  t.truthy(topicHelper.isDefaultTopicId(config.rivescriptTopics.default.id));
  t.falsy(topicHelper.isDefaultTopicId(stubs.getContentfulId()));
});

// getTopicTemplateText
test('getTopicTemplateText returns a string when template exists', () => {
  const topic = topicFactory.getValidPhotoPostConfig();
  const templateName = 'startPhotoPostAutoReply';
  const result = topicHelper.getTopicTemplateText(topic, templateName);
  result.should.equal(topic.templates[templateName].text);
});

test('getTopicTemplateText throws when template undefined', (t) => {
  const topic = topicFactory.getValidPhotoPostConfig();
  const templateName = 'winterfell';
  t.throws(() => topicHelper.getTopicTemplateText(topic, templateName));
});

// getTransitionTemplateName
test('getTransitionTemplateName returns transitionTemplate if defined in config.types ', () => {
  const topic = topicFactory.getValidTextPostConfig();
  const result = topicHelper.getTransitionTemplateName(topic);
  result.should.equal(config.types.textPostConfig.transitionTemplate);
});

test('getTransitionTemplateName returns rivescript template if config.types undefined', () => {
  const topic = { type: stubs.getRandomWord() };
  const result = topicHelper.getTransitionTemplateName(topic);
  result.should.equal(templateConfig.templatesMap.rivescriptReply);
});

// getTransitionTemplateText
test('getTransitionTemplateText returns askText text for textPostConfig topics', () => {
  const topic = topicFactory.getValidTextPostConfig();
  const result = topicHelper.getTransitionTemplateText(topic);
  result.should.equal(topic.templates.askText.text);
});

test('getTransitionTemplateText returns startExternalPost text for externalPostConfig topics ', () => {
  const topic = topicFactory.getValidExternalPostConfig();
  const result = topicHelper.getTransitionTemplateText(topic);
  result.should.equal(topic.templates.startExternalPost.text);
});

test('getTransitionTemplateText returns startPhotoPost text for photoPostConfig topics ', () => {
  const topic = topicFactory.getValidPhotoPostConfig();
  const result = topicHelper.getTransitionTemplateText(topic);
  result.should.equal(topic.templates.startPhotoPost.text);
});

test('getTransitionTemplateText returns null if topic type not externalPostConfig, photoPostConfig, or textPostConfig', (t) => {
  const topic = topicFactory.getValidAutoReply();
  const result = topicHelper.getTransitionTemplateText(topic);
  t.is(result, null);
});
