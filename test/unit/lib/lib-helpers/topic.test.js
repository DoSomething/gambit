'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const gambitCampaigns = require('../../../../lib/gambit-campaigns');
const helpers = require('../../../../lib/helpers');
const stubs = require('../../../helpers/stubs');
const defaultTopicTriggerFactory = require('../../../helpers/factories/defaultTopicTrigger');

chai.should();
chai.use(sinonChai);

// module to be tested
const topicHelper = require('../../../../lib/helpers/topic');

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
  const templateName = stubs.getTemplate();
  const templateText = stubs.getRandomMessageText();
  // TODO: Add topic factory.
  const topic = {
    id: stubs.getContentfulId(),
    templates: {},
  };
  topic.templates[templateName] = { rendered: templateText };

  const result = topicHelper.getRenderedTextFromTopicAndTemplateName(topic, templateName);
  result.should.equal(templateText);
});

test('getRenderedTextFromTopicAndTemplateName throws when template undefined', (t) => {
  const topic = { id: stubs.getContentfulId() };
  const templateName = stubs.getTemplate();
  t.throws(() => topicHelper.getRenderedTextFromTopicAndTemplateName(topic, templateName));
});
