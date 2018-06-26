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
const defaultTopicTriggerFactory = require('../../../helpers/factories/defaultTopicTrigger');
const topicFactory = require('../../../helpers/factories/topic');
const config = require('../../../../config/lib/helpers/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const topicHelper = require('../../../../lib/helpers/topic');

const hardcodedTopicId = config.hardcodedTopicIds[0];
const replyTrigger = defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger();
const redirectTrigger = defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger();

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchAllDefaultTopicTriggers
test('fetchAllDefaultTopicTriggers should call parseDefaultTopicTrigger on gambitCampaigns.fetchDefaultTopicTriggers success', async () => {
  const mockResponse = [replyTrigger, redirectTrigger];
  sandbox.stub(gambitCampaigns, 'fetchDefaultTopicTriggers')
    .returns(Promise.resolve(mockResponse));
  sandbox.stub(topicHelper, 'parseDefaultTopicTrigger')
    .returns(replyTrigger);

  const result = await topicHelper.fetchAllDefaultTopicTriggers();
  mockResponse.forEach((item) => {
    topicHelper.parseDefaultTopicTrigger.should.have.been.calledWith(item);
  });
  gambitCampaigns.fetchDefaultTopicTriggers.should.have.been.called;
  result.should.deep.equal([replyTrigger, replyTrigger]);
});

test('fetchAllDefaultTopicTriggers should throw on gambitCampaigns.fetchDefaultTopicTriggers fail', async (t) => {
  const mockError = new Error('epic fail');
  sandbox.stub(gambitCampaigns, 'fetchDefaultTopicTriggers')
    .returns(Promise.reject(mockError));
  sandbox.stub(topicHelper, 'parseDefaultTopicTrigger')
    .returns(replyTrigger);

  const result = await t.throws(topicHelper.fetchAllDefaultTopicTriggers());
  gambitCampaigns.fetchDefaultTopicTriggers.should.have.been.called;
  topicHelper.parseDefaultTopicTrigger.should.not.have.been.called;
  result.should.deep.equal(mockError);
});

// fetchAllTopics
test('fetchAllTopics should call gambitCampaigns.fetchTopics', async () => {
  const mockResponse = [topicFactory.getValidTopic(), topicFactory.getValidTopic()];
  sandbox.stub(gambitCampaigns, 'fetchTopics')
    .returns(Promise.resolve(mockResponse));

  const result = await topicHelper.fetchAllTopics();
  gambitCampaigns.fetchTopics.should.have.been.called;
  result.should.deep.equal(mockResponse);
});

// fetchById
test('fetchById should return 404 error if topicId is the random topicId', async (t) => {
  const mockTopic = topicFactory.getValidTopic();
  sandbox.stub(topicHelper, 'isRandomTopicId')
    .returns(true);
  sandbox.stub(gambitCampaigns, 'fetchTopicById')
    .returns(Promise.resolve(mockTopic));

  const result = await t.throws(topicHelper.fetchById());
  gambitCampaigns.fetchTopicById.should.not.have.been.called;
  result.status.should.equal(404);
});

test('fetchById should call gambitCampaigns.fetchTopicById and return object if topicId is not hardcoded', async () => {
  const mockTopic = topicFactory.getValidTopic();
  sandbox.stub(topicHelper, 'isRandomTopicId')
    .returns(false);
  sandbox.stub(topicHelper, 'isHardcodedTopicId')
    .returns(false);
  sandbox.stub(gambitCampaigns, 'fetchTopicById')
    .returns(Promise.resolve(mockTopic));

  const result = await topicHelper.fetchById();
  gambitCampaigns.fetchTopicById.should.have.been.called;
  result.should.deep.equal(mockTopic);
});

test('fetchById should return a string if topicId is hardcoded', async () => {
  const mockTopic = topicFactory.getValidTopic();
  sandbox.stub(topicHelper, 'isRandomTopicId')
    .returns(false);
  sandbox.stub(topicHelper, 'isHardcodedTopicId')
    .returns(true);
  sandbox.stub(gambitCampaigns, 'fetchTopicById')
    .returns(Promise.resolve(mockTopic));

  const result = await topicHelper.fetchById(hardcodedTopicId);
  gambitCampaigns.fetchTopicById.should.not.have.been.called;
  result.should.equal(hardcodedTopicId);
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

// isRandomTopicId
test('isRandomTopicId should return whether topicId is config.randomTopicId', (t) => {
  t.truthy(topicHelper.isRandomTopicId(config.randomTopicId));
  t.falsy(topicHelper.isRandomTopicId(stubs.getContentfulId()));
});

// parseDefaultTopicTrigger
test('parseDefaultTopicTrigger should return null if defaultTopicTrigger undefined', (t) => {
  const result = topicHelper.parseDefaultTopicTrigger();
  t.is(result, null);
});

test('parseDefaultTopicTrigger should return defaultTopicTrigger if defaultTopicTrigger.topicId undefined', () => {
  const defaultTopicTrigger = defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger();
  const result = topicHelper.parseDefaultTopicTrigger(defaultTopicTrigger);
  result.should.deep.equal(defaultTopicTrigger);
});

test('parseDefaultTopicTrigger should return object with a changeTopic macro reply if defaultTopicTrigger.topicId', () => {
  const mockChangeTopicMacro = `changeTopicTo${stubs.getTopicId()}`;
  sandbox.stub(helpers.macro, 'getChangeTopicMacroFromTopicId')
    .returns(mockChangeTopicMacro);
  const defaultTopicTrigger = defaultTopicTriggerFactory.getValidChangeTopicDefaultTopicTrigger();
  const result = topicHelper.parseDefaultTopicTrigger(defaultTopicTrigger);
  result.reply.should.equal(mockChangeTopicMacro);
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
