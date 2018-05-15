'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const contentful = require('../../../../lib/contentful');
const config = require('../../../../config/lib/helpers/rivescript');
const stubs = require('../../../helpers/stubs');
const defaultRivescriptTopicTriggerFactory = require('../../../helpers/factories/contentful/defaultRivescriptTopicTrigger');

chai.should();
chai.use(sinonChai);

// module to be tested
const rivescriptHelper = require('../../../../lib/helpers/rivescript');

const mockDefaultTopicTrigger = defaultRivescriptTopicTriggerFactory
  .getValidDefaultRivescriptTopicTrigger();
const mockDefaultTopicTriggerResponse = defaultRivescriptTopicTriggerFactory
  .getValidDefaultRivescriptTopicTrigger();
const mockRivescriptCommandOperator = config.commands.trigger;
const mockWord = stubs.getRandomWord();
const mockRivescriptCommand = `${mockRivescriptCommandOperator}${config.separators.command}${mockWord}`;
const mockRivescriptLine = `${mockRivescriptCommand}${config.separators.line}`;

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchRivescript
test('fetchRivescript should call parseDefaultRivescriptTopicTrigger on contentful.fetchDefaultRivescriptTopicTriggers success', async () => {
  // TODO: Create a defaultRivescriptTopicTrigger factory to replace these objects.
  const firstMockEntry = { trigger: stubs.getRandomWord() };
  const secondMockEntry = { trigger: stubs.getRandomWord() };
  const mockEntries = [firstMockEntry, secondMockEntry];
  sandbox.stub(contentful, 'fetchDefaultRivescriptTopicTriggers')
    .returns(Promise.resolve(mockEntries));
  sandbox.stub(rivescriptHelper, 'parseDefaultRivescriptTopicTrigger')
    .returns(mockRivescriptLine);

  const result = await rivescriptHelper.fetchRivescript();
  mockEntries.forEach((entry) => {
    rivescriptHelper.parseDefaultRivescriptTopicTrigger.should.have.been.calledWith(entry);
  });
  contentful.fetchDefaultRivescriptTopicTriggers.should.have.been.called;
  result.should.deep.equal([mockRivescriptLine, mockRivescriptLine]);
});

test('fetchRivescript should return contentful.fetchDefaultRivescriptTopicTriggers error on fail', async (t) => {
  const mockError = new Error('epic fail');
  sandbox.stub(contentful, 'fetchDefaultRivescriptTopicTriggers')
    .returns(Promise.reject(mockError));
  sandbox.stub(rivescriptHelper, 'parseDefaultRivescriptTopicTrigger')
    .returns(mockRivescriptLine);

  const result = await t.throws(rivescriptHelper.fetchRivescript());
  contentful.fetchDefaultRivescriptTopicTriggers.should.have.been.called;
  rivescriptHelper.parseDefaultRivescriptTopicTrigger.should.not.have.been.called;
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

// getResponseFromDefaultRivescriptTopicTrigger
test('getResponseFromDefaultRivescriptTopicTrigger should return getRedirectCommandFromText if response entry isDefaultRivescriptTopicTrigger', () => {
  sandbox.stub(contentful, 'getResponseFromDefaultRivescriptTopicTrigger')
    .returns(mockDefaultTopicTriggerResponse);
  sandbox.stub(contentful, 'isDefaultRivescriptTopicTrigger')
    .returns(true);
  sandbox.stub(contentful, 'getTriggerFromDefaultRivescriptTopicTrigger')
    .returns(mockWord);
  sandbox.stub(rivescriptHelper, 'getRedirectCommandFromText')
    .returns(mockRivescriptLine);

  const result = rivescriptHelper
    .getResponseFromDefaultRivescriptTopicTrigger(mockDefaultTopicTrigger);
  contentful.getResponseFromDefaultRivescriptTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  contentful.isDefaultRivescriptTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  contentful.getTriggerFromDefaultRivescriptTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTriggerResponse);
  rivescriptHelper.getRedirectCommandFromText
    .should.have.been.calledWith(mockWord);
  result.should.equal(mockRivescriptLine);
});


test('getResponseFromDefaultRivescriptTopicTrigger should return getResponseCommandFromText if response entry isMessage', () => {
  sandbox.stub(contentful, 'getResponseFromDefaultRivescriptTopicTrigger')
    .returns(mockDefaultTopicTriggerResponse);
  sandbox.stub(contentful, 'isDefaultRivescriptTopicTrigger')
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
    .getResponseFromDefaultRivescriptTopicTrigger(mockDefaultTopicTrigger);
  contentful.getResponseFromDefaultRivescriptTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  contentful.isDefaultRivescriptTopicTrigger
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

test('getResponseFromDefaultRivescriptTopicTrigger throws if response entry not isMessage and not isDefaultRivescriptTopicTrigger', (t) => {
  sandbox.stub(contentful, 'getResponseFromDefaultRivescriptTopicTrigger')
    .returns(mockDefaultTopicTriggerResponse);
  sandbox.stub(contentful, 'isDefaultRivescriptTopicTrigger')
    .returns(false);
  sandbox.stub(contentful, 'isMessage')
    .returns(false);

  t.throws(() => {
    rivescriptHelper.getResponseFromDefaultRivescriptTopicTrigger(mockDefaultTopicTrigger);
  });
});

// getTriggerFromDefaultRivescriptTopicTrigger
test('getTriggerFromDefaultRivescriptTopicTrigger should return formatRivescriptLine with trigger command and contentful.getTriggerFromDefaultRivescriptTopicTrigger', () => {
  sandbox.stub(contentful, 'getTriggerFromDefaultRivescriptTopicTrigger')
    .returns(mockWord);
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRivescriptLine);
  const triggerCommand = config.commands.trigger;


  const result = rivescriptHelper
    .getTriggerFromDefaultRivescriptTopicTrigger(mockDefaultTopicTrigger);
  contentful.getTriggerFromDefaultRivescriptTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  rivescriptHelper.formatRivescriptLine.should.have.been.calledWith(triggerCommand, mockWord);
  result.should.equal(mockRivescriptLine);
});

// parseDefaultRivescriptTopicTrigger
test('parseDefaultRivescriptTopicTrigger should concat getTriggerFromDefaultRivescriptTopicTrigger and getResponseFromDefaultRivescriptTopicTrigger', () => {
  const mockTrigger = stubs.getRandomWord();
  sandbox.stub(rivescriptHelper, 'getTriggerFromDefaultRivescriptTopicTrigger')
    .returns(mockTrigger);
  const mockResponse = stubs.getRandomWord();
  sandbox.stub(rivescriptHelper, 'getResponseFromDefaultRivescriptTopicTrigger')
    .returns(mockResponse);

  const result = rivescriptHelper.parseDefaultRivescriptTopicTrigger(mockDefaultTopicTrigger);
  rivescriptHelper.getTriggerFromDefaultRivescriptTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  rivescriptHelper.getResponseFromDefaultRivescriptTopicTrigger
    .should.have.been.calledWith(mockDefaultTopicTrigger);
  result.should.equal(`${mockTrigger}${mockResponse}`);
});
