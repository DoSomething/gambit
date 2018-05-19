'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const contentful = require('../../../../lib/contentful');
const stubs = require('../../../helpers/stubs');
const defaultTopicTriggerFactory = require('../../../helpers/factories/contentful/defaultTopicTrigger');

chai.should();
chai.use(sinonChai);

// module to be tested
const topicHelper = require('../../../../lib/helpers/topic');

const mockDefaultTopicTrigger = defaultTopicTriggerFactory
  .getValidDefaultTopicTrigger();
const mockDefaultTopicTriggerResponse = defaultTopicTriggerFactory
  .getValidDefaultTopicTrigger();
const mockWord = stubs.getRandomWord();
const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchDefaultTopicTriggers
test('fetchAllDefaultTopicTriggers should call parseDefaultTopicTriggerFromContentfulEntry on contentful.fetchDefaultTopicTriggers success', async () => {
  // TODO: Create a defaultTopicTrigger factory to replace these objects.
  const firstMockEntry = { trigger: stubs.getRandomWord() };
  const secondMockEntry = { trigger: stubs.getRandomWord() };
  const mockEntries = [firstMockEntry, secondMockEntry];
  sandbox.stub(contentful, 'fetchDefaultTopicTriggers')
    .returns(Promise.resolve(mockEntries));
  sandbox.stub(topicHelper, 'parseDefaultTopicTriggerFromContentfulEntry')
    .returns(firstMockEntry);

  await topicHelper.fetchAllDefaultTopicTriggers();
  mockEntries.forEach((entry) => {
    topicHelper.parseDefaultTopicTriggerFromContentfulEntry.should.have.been.calledWith(entry);
  });
  contentful.fetchDefaultTopicTriggers.should.have.been.called;
});

test('fetchAllDefaultTopicTriggers should return contentful.fetchDefaultTopicTriggers error on fail', async (t) => {
  const mockError = new Error('epic fail');
  sandbox.stub(contentful, 'fetchDefaultTopicTriggers')
    .returns(Promise.reject(mockError));
  sandbox.stub(topicHelper, 'parseDefaultTopicTriggerFromContentfulEntry')
    .returns({});

  const result = await t.throws(topicHelper.fetchAllDefaultTopicTriggers());
  contentful.fetchDefaultTopicTriggers.should.have.been.called;
  topicHelper.parseDefaultTopicTriggerFromContentfulEntry.should.not.have.been.called;
  result.should.deep.equal(mockError);
});


// parseDefaultTopicTriggerFromContentfulEntry
test('parseDefaultTopicTriggerFromContentfulEntry should return redirect if response entry isDefaultTopicTrigger', () => {
  sandbox.stub(contentful, 'getTriggerTextFromDefaultTopicTrigger')
    .returns(mockWord);
  sandbox.stub(contentful, 'getResponseEntryFromDefaultTopicTrigger')
    .returns(mockDefaultTopicTriggerResponse);
  sandbox.stub(contentful, 'isDefaultTopicTrigger')
    .returns(true);

  const result = topicHelper.parseDefaultTopicTriggerFromContentfulEntry(mockDefaultTopicTrigger);
  contentful.getTriggerTextFromDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  result.trigger.should.equal(mockWord);
  contentful.getResponseEntryFromDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  contentful.isDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  contentful.getTriggerTextFromDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  result.should.have.property('redirect');
});


test('parseDefaultTopicTriggerFromContentfulEntry should return reply if response entry isMessage', () => {
  sandbox.stub(contentful, 'getTriggerTextFromDefaultTopicTrigger')
    .returns(mockWord);
  sandbox.stub(contentful, 'getResponseEntryFromDefaultTopicTrigger')
    .returns(mockDefaultTopicTriggerResponse);
  sandbox.stub(contentful, 'isDefaultTopicTrigger')
    .returns(false);
  sandbox.stub(contentful, 'isMessage')
    .returns(true);
  sandbox.stub(contentful, 'getTextFromMessage')
    .returns(mockWord);

  const result = topicHelper.parseDefaultTopicTriggerFromContentfulEntry(mockDefaultTopicTrigger);
  contentful.getResponseEntryFromDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  contentful.isDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  contentful.isMessage
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  contentful.getTextFromMessage
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  result.reply.should.equal(mockWord);
});

test('parseDefaultTopicTriggerFromContentfulEntry should return object with trigger and reply', () => {
  sandbox.stub(contentful, 'getTriggerTextFromDefaultTopicTrigger')
    .returns(mockWord);
  sandbox.stub(contentful, 'getContentfulIdFromContentfulEntry')
    .returns(stubs.getContentfulId());
  sandbox.stub(contentful, 'isDefaultTopicTrigger')
    .returns(false);
  sandbox.stub(contentful, 'isMessage')
    .returns(true);
  const mockMacroName = stubs.getRandomWord();
  sandbox.stub(contentful, 'getTextFromMessage')
    .returns(mockMacroName);
  const result = topicHelper.parseDefaultTopicTriggerFromContentfulEntry(mockDefaultTopicTrigger);
  result.reply.should.equal(mockMacroName);
});
