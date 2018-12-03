'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const gambitContent = require('../../../../lib/gambit-content');
const helpers = require('../../../../lib/helpers');
const stubs = require('../../../helpers/stubs');
const broadcastFactory = require('../../../helpers/factories/broadcast');
const topicFactory = require('../../../helpers/factories/topic');
const config = require('../../../../config/lib/helpers/topic');
const repliesConfig = require('../../../../config/lib/helpers/replies');
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
test('fetchById should return gambitContent.fetchTopicById', async () => {
  const topic = topicFactory.getValidTopic();
  const topicId = topic.id;
  sandbox.stub(gambitContent, 'fetchTopicById')
    .returns(Promise.resolve(topic));

  const result = await topicHelper.fetchById(topicId);
  gambitContent.fetchTopicById.should.have.been.calledWith(topicId);
  result.should.deep.equal(topic);
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

// hasActiveCampaign
test('hasActiveCampaign returns true if topic has campaign that is not closed', (t) => {
  sandbox.stub(topicHelper, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(false);
  const topic = topicFactory.getValidTopic();

  t.truthy(topicHelper.hasActiveCampaign(topic));
  topicHelper.hasCampaign.should.have.been.calledWith(topic);
  helpers.campaign.isClosedCampaign.should.have.been.calledWith(topic.campaign);
});

test('hasActiveCampaign returns false if topic has campaign that is closed', (t) => {
  sandbox.stub(topicHelper, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(true);
  const topic = topicFactory.getValidTopic();

  t.falsy(topicHelper.hasActiveCampaign(topic));
});

test('hasActiveCampaign returns false if topic does not have campaign', (t) => {
  sandbox.stub(topicHelper, 'hasCampaign')
    .returns(false);
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(false);
  const topic = topicFactory.getValidTopic();

  t.falsy(topicHelper.hasActiveCampaign(topic));
});

// hasCampaign
test('hasCampaign should return boolean of whether topic.campaign.id exists', (t) => {
  t.truthy(topicHelper.hasCampaign(topicFactory.getValidTextPostConfig()));
  t.falsy(topicHelper.hasCampaign(topicFactory.getValidTopicWithoutCampaign()));
});

// hasClosedCampaign
test('hasClosedCampaign returns true if topic has campaign that is closed', (t) => {
  sandbox.stub(topicHelper, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(true);
  const topic = topicFactory.getValidTopic();

  t.truthy(topicHelper.hasClosedCampaign(topic));
  topicHelper.hasCampaign.should.have.been.calledWith(topic);
  helpers.campaign.isClosedCampaign.should.have.been.calledWith(topic.campaign);
});

test('hasClosedCampaign returns false if topic has campaign that is not closed', (t) => {
  sandbox.stub(topicHelper, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(false);
  const topic = topicFactory.getValidTopic();

  t.falsy(topicHelper.hasClosedCampaign(topic));
});

test('hasClosedCampaign returns false if topic does not have campaign', (t) => {
  sandbox.stub(topicHelper, 'hasCampaign')
    .returns(false);
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(true);
  const topic = topicFactory.getValidTopic();

  t.falsy(topicHelper.hasClosedCampaign(topic));
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

// isDeprecated
test('isDeprecated should return true when topic.deprecated property is set to true', (t) => {
  t.falsy(topicHelper.isDeprecated(config.rivescriptTopics.unsubscribed));
  t.truthy(topicHelper.isDeprecated(config.rivescriptTopics.campaign));
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

// isPhotoPostConfig
test('isPhotoPostConfig returns whether topic type is photoPostConfig', (t) => {
  t.truthy(topicHelper.isPhotoPostConfig(topicFactory.getValidPhotoPostConfig()));
  t.falsy(topicHelper.isPhotoPostConfig(topicFactory.getValidAutoReply()));
});

// isTextPostConfig
test('isTextPostConfig returns whether topic type is textPostConfig', (t) => {
  t.truthy(topicHelper.isTextPostConfig(topicFactory.getValidTextPostConfig()));
  t.falsy(topicHelper.isTextPostConfig(topicFactory.getValidAutoReply()));
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
test('getTransitionTemplateName returns closedCampaign name if topic hasClosedCampaign', () => {
  sandbox.stub(topicHelper, 'hasClosedCampaign')
    .returns(true);
  const topic = { type: stubs.getRandomWord() };
  const result = topicHelper.getTransitionTemplateName(topic);
  result.should.equal(repliesConfig.campaignClosed.name);
});

test('getTransitionTemplateName returns transitionTemplate if defined in config.types ', () => {
  sandbox.stub(topicHelper, 'hasClosedCampaign')
    .returns(false);
  const topic = topicFactory.getValidTextPostConfig();
  const result = topicHelper.getTransitionTemplateName(topic);
  result.should.equal(config.types.textPostConfig.transitionTemplate);
});

test('getTransitionTemplateName returns rivescript template if config.types undefined', () => {
  sandbox.stub(topicHelper, 'hasClosedCampaign')
    .returns(false);
  const topic = { type: stubs.getRandomWord() };
  const result = topicHelper.getTransitionTemplateName(topic);
  result.should.equal(templateConfig.templatesMap.rivescriptReply);
});
