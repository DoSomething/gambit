'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const contentful = require('../../../../lib/contentful');
const config = require('../../../../config/lib/helpers/rivescript');
const stubs = require('../../../helpers/stubs');
const defaultTopicTriggerFactory = require('../../../helpers/factories/contentful/defaultTopicTrigger');

chai.should();
chai.use(sinonChai);

// module to be tested
const rivescriptHelper = require('../../../../lib/helpers/rivescript');

const mockDefaultTopicTrigger = defaultTopicTriggerFactory
  .getValidDefaultTopicTrigger();
const mockDefaultTopicTriggerResponse = defaultTopicTriggerFactory
  .getValidDefaultTopicTrigger();
const mockRivescriptCommandOperator = config.commands.trigger;
const mockWord = stubs.getRandomWord();
const mockRivescriptCommand = `${mockRivescriptCommandOperator}${config.separators.command}${mockWord}`;
const mockRivescriptLine = `${mockRivescriptCommand}${config.separators.line}`;

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchRivescript
test('fetchRivescript should call parseDefaultTopicTrigger on contentful.fetchDefaultTopicTriggers success', async () => {
  // TODO: Create a defaultTopicTrigger factory to replace these objects.
  const firstMockEntry = { trigger: stubs.getRandomWord() };
  const secondMockEntry = { trigger: stubs.getRandomWord() };
  const mockEntries = [firstMockEntry, secondMockEntry];
  sandbox.stub(contentful, 'fetchDefaultTopicTriggers')
    .returns(Promise.resolve(mockEntries));
  sandbox.stub(rivescriptHelper, 'parseDefaultTopicTrigger')
    .returns(mockRivescriptLine);

  const result = await rivescriptHelper.fetchRivescript();
  mockEntries.forEach((entry) => {
    rivescriptHelper.parseDefaultTopicTrigger.should.have.been.calledWith(entry);
  });
  contentful.fetchDefaultTopicTriggers.should.have.been.called;
  result.should.deep.equal([mockRivescriptLine, mockRivescriptLine]);
});

test('fetchRivescript should return contentful.fetchDefaultTopicTriggers error on fail', async (t) => {
  const mockError = new Error('epic fail');
  sandbox.stub(contentful, 'fetchDefaultTopicTriggers')
    .returns(Promise.reject(mockError));
  sandbox.stub(rivescriptHelper, 'parseDefaultTopicTrigger')
    .returns(mockRivescriptLine);

  const result = await t.throws(rivescriptHelper.fetchRivescript());
  contentful.fetchDefaultTopicTriggers.should.have.been.called;
  rivescriptHelper.parseDefaultTopicTrigger.should.not.have.been.called;
  result.should.deep.equal(mockError);
});

// formatRivescriptLine
test('formatRivescriptLine should return a trimmed concat of operator and value args', () => {
  const result = rivescriptHelper.formatRivescriptLine(mockRivescriptCommandOperator, `${mockWord}   `);
  result.should.equal(mockRivescriptLine);
});

// getRedirectCommandFromText
test('getRedirectCommandFromText should return formatRivescriptLine with response command and text', () => {
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRivescriptLine);
  const redirectCommand = config.commands.redirect;

  const result = rivescriptHelper.getRedirectCommandFromText(mockWord);
  rivescriptHelper.formatRivescriptLine.should.have.been.calledWith(redirectCommand, mockWord);
  result.should.equal(mockRivescriptLine);
});

// getResponseCommandFromText
test('getResponseCommandFromText should return formatRivescriptLine with response command and text', () => {
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRivescriptLine);
  const responseCommand = config.commands.response;

  const result = rivescriptHelper.getResponseCommandFromText(mockWord);
  rivescriptHelper.formatRivescriptLine.should.have.been.calledWith(responseCommand, mockWord);
  result.should.equal(mockRivescriptLine);
});

// getResponseFromDefaultTopicTrigger
test('getResponseFromDefaultTopicTrigger should return getRedirectCommandFromText if response entry isDefaultTopicTrigger', () => {
  sandbox.stub(contentful, 'getResponseFromDefaultTopicTrigger')
    .returns(mockDefaultTopicTriggerResponse);
  sandbox.stub(contentful, 'isDefaultTopicTrigger')
    .returns(true);
  sandbox.stub(contentful, 'getTriggerFromDefaultTopicTrigger')
    .returns(mockWord);
  sandbox.stub(rivescriptHelper, 'getRedirectCommandFromText')
    .returns(mockRivescriptLine);

  const result = rivescriptHelper
    .getResponseFromDefaultTopicTrigger(mockDefaultTopicTrigger);
  contentful.getResponseFromDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  contentful.isDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  contentful.getTriggerFromDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  rivescriptHelper.getRedirectCommandFromText
    .should.have.been.calledWith(mockWord);
  result.should.equal(mockRivescriptLine);
});


test('getResponseFromDefaultTopicTrigger should return getResponseCommandFromText if response entry isMessage', () => {
  sandbox.stub(contentful, 'getResponseFromDefaultTopicTrigger')
    .returns(mockDefaultTopicTriggerResponse);
  sandbox.stub(contentful, 'isDefaultTopicTrigger')
    .returns(false);
  sandbox.stub(contentful, 'isMessage')
    .returns(true);
  sandbox.stub(contentful, 'getTextFromMessage')
    .returns(mockWord);
  sandbox.stub(rivescriptHelper, 'getRedirectCommandFromText')
    .returns(stubs.getRandomWord());
  sandbox.stub(rivescriptHelper, 'getResponseCommandFromText')
    .returns(mockRivescriptLine);

  const result = rivescriptHelper
    .getResponseFromDefaultTopicTrigger(mockDefaultTopicTrigger);
  contentful.getResponseFromDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  contentful.isDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  contentful.isMessage
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  contentful.getTextFromMessage
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  rivescriptHelper.getRedirectCommandFromText.should.not.have.been.called;
  rivescriptHelper.getResponseCommandFromText
    .should.have.been.calledWith(mockWord);
  result.should.equal(mockRivescriptLine);
});

test('getResponseFromDefaultTopicTrigger throws if response entry not isMessage and not isDefaultTopicTrigger', (t) => {
  sandbox.stub(contentful, 'getResponseFromDefaultTopicTrigger')
    .returns(mockDefaultTopicTriggerResponse);
  sandbox.stub(contentful, 'isDefaultTopicTrigger')
    .returns(false);
  sandbox.stub(contentful, 'isMessage')
    .returns(false);

  t.throws(() => {
    rivescriptHelper.getResponseFromDefaultTopicTrigger(mockDefaultTopicTrigger);
  });
});

// getTriggerFromDefaultTopicTrigger
test('getTriggerFromDefaultTopicTrigger should return formatRivescriptLine with trigger command and contentful.getTriggerFromDefaultTopicTrigger', () => {
  sandbox.stub(contentful, 'getTriggerFromDefaultTopicTrigger')
    .returns(mockWord);
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRivescriptLine);
  const triggerCommand = config.commands.trigger;


  const result = rivescriptHelper
    .getTriggerFromDefaultTopicTrigger(mockDefaultTopicTrigger);
  contentful.getTriggerFromDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  rivescriptHelper.formatRivescriptLine.should.have.been.calledWith(triggerCommand, mockWord);
  result.should.equal(mockRivescriptLine);
});

// parseDefaultTopicTrigger
test('parseDefaultTopicTrigger should concat getTriggerFromDefaultTopicTrigger and getResponseFromDefaultTopicTrigger', () => {
  const mockTrigger = stubs.getRandomWord();
  sandbox.stub(rivescriptHelper, 'getTriggerFromDefaultTopicTrigger')
    .returns(mockTrigger);
  const mockResponse = stubs.getRandomWord();
  sandbox.stub(rivescriptHelper, 'getResponseFromDefaultTopicTrigger')
    .returns(mockResponse);

  const result = rivescriptHelper.parseDefaultTopicTrigger(mockDefaultTopicTrigger);
  rivescriptHelper.getTriggerFromDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  rivescriptHelper.getResponseFromDefaultTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  result.should.equal(`${mockTrigger}${mockResponse}`);
});
