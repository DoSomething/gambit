'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const contentful = require('../../../../lib/contentful');
const config = require('../../../../config/lib/helpers/rivescript');
const stubs = require('../../../helpers/stubs');

chai.should();
chai.use(sinonChai);

// module to be tested
const rivescriptHelper = require('../../../../lib/helpers/rivescript');

const mockWord = stubs.getRandomWord();
const mockRivescriptCommandOperator = config.commands.trigger;
const mockRivescriptCommand = `${mockRivescriptCommandOperator}${config.separators.command}${mockWord}`;
const mockRivescriptLine = `${mockRivescriptCommand}${config.separators.line}`;

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchDefaultRivescriptTopicTriggers
test('fetchDefaultRivescriptTopicTriggers should call parseDefaultRivescriptTopicTrigger on contentful.fetchDefaultRivescriptTopicTriggers success', async () => {
  // TODO: Create a defaultRivescriptTopicTrigger factory to replace these objects.
  const firstMockEntry = { trigger: stubs.getRandomWord() };
  const secondMockEntry = { trigger: stubs.getRandomWord() };
  const mockEntries = [firstMockEntry, secondMockEntry];
  sandbox.stub(contentful, 'fetchDefaultRivescriptTopicTriggers')
    .returns(Promise.resolve(mockEntries));
  sandbox.stub(rivescriptHelper, 'parseDefaultRivescriptTopicTrigger')
    .returns(mockRivescriptLine);

  const result = await rivescriptHelper.fetchDefaultRivescriptTopicTriggers();
  mockEntries.forEach((entry) => {
    rivescriptHelper.parseDefaultRivescriptTopicTrigger.should.have.been.calledWith(entry);
  });
  contentful.fetchDefaultRivescriptTopicTriggers.should.have.been.called;
  result.should.deep.equal([mockRivescriptLine, mockRivescriptLine]);
});

test('fetchDefaultRivescriptTopicTriggers should return contentful.fetchDefaultRivescriptTopicTriggers error on fail', async (t) => {
  const mockError = new Error('epic fail');
  sandbox.stub(contentful, 'fetchDefaultRivescriptTopicTriggers')
    .returns(Promise.reject(mockError));
  sandbox.stub(rivescriptHelper, 'parseDefaultRivescriptTopicTrigger')
    .returns(mockRivescriptLine);

  const result = await t.throws(rivescriptHelper.fetchDefaultRivescriptTopicTriggers());
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

// getTriggerCommandFromText
test('getTriggerCommandFromText should return formatRivescriptLine with trigger command and text', () => {
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRivescriptLine);
  const triggerCommand = config.commands.trigger;

  const result = rivescriptHelper.getTriggerCommandFromText(mockWord);
  rivescriptHelper.formatRivescriptLine.should.have.been.calledWith(triggerCommand, mockWord);
  result.should.equal(mockRivescriptLine);
});
